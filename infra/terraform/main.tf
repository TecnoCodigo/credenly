terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.80"
    }
  }

  backend "gcs" {
    bucket  = "credenly-tf-state"
    prefix  = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "allowed_ssh_ip" {
  description = "IP address allowed to SSH into the instance (or use IAP range)"
  type        = string
  default     = "35.235.240.0/20" # Default allows Identity-Aware Proxy (IAP)
}

# 1. VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "credenly-vpc-network"
  auto_create_subnetworks = false
}

# 2. Subnet for the VM (Database)
resource "google_compute_subnetwork" "db_subnet" {
  name          = "credenly-db-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

# 3. Subnet for Cloud Run (Serverless VPC Access connector or Direct VPC Egress)
resource "google_compute_subnetwork" "serverless_subnet" {
  name          = "credenly-serverless-subnet"
  ip_cidr_range = "10.0.2.0/28"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

# 4. Firewall Rule: Allow SSH via IAP
resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "credenly-allow-ssh-iap"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  
  source_ranges = [var.allowed_ssh_ip]
  target_tags   = ["credenly-db-instance"]
}

# 5. Firewall Rule: Allow MySQL only from Cloud Run Serverless Subnet
resource "google_compute_firewall" "allow_mysql_internal" {
  name    = "credenly-allow-mysql-internal"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["3306"]
  }
  
  source_ranges = ["10.0.2.0/28"] # Only allow Cloud Run
  target_tags   = ["credenly-db-instance"]
}

# 6. Database VM (e2-micro Free Tier)
resource "google_compute_instance" "db_instance" {
  name         = "credenly-mysql-db-v2"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = ["credenly-db-instance"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = 30
      type  = "pd-standard" # Free tier uses standard persistent disk
    }
  }

  network_interface {
    network    = google_compute_network.vpc_network.id
    subnetwork = google_compute_subnetwork.db_subnet.id
    
    # Empty access_config means NO external IP for maximum security
    # We will use IAP to connect to it via SSH.
    access_config {
      // Ephemeral public IP required for outbound internet to install docker
    }
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl enable docker
    sudo systemctl start docker

    # Clone project or write docker-compose directly to spin up MySQL
    mkdir -p /opt/credenly-db
    cat <<EOF > /opt/credenly-db/docker-compose.yml
    version: '3.8'
    services:
      mysql_db:
        image: mysql:5.7
        container_name: credenly_mysql_db
        restart: always
        environment:
          MYSQL_ROOT_PASSWORD: rootpassword
          MYSQL_DATABASE: sistema_autenticacion
          MYSQL_USER: credenly_user
          MYSQL_PASSWORD: credenly_password
        ports:
          - "3306:3306"
        volumes:
          - mysql_data:/var/lib/mysql
    volumes:
      mysql_data:
    EOF
    
    cd /opt/credenly-db
    sudo docker-compose up -d
  EOT
}

# 7. Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "credenly-repo"
  description   = "Docker repository para el backend"
  format        = "DOCKER"
}

# 8. Serverless VPC Access Connector (For Cloud Run to reach the VM)
resource "google_vpc_access_connector" "connector" {
  name          = "credenly-vpc-conn"
  region        = var.region
  subnet {
    name = google_compute_subnetwork.serverless_subnet.name
  }
  machine_type = "e2-micro"
  min_instances = 2
  max_instances = 3
}

# 8. Cloud Run Service (Backend)
resource "google_cloud_run_v2_service" "backend" {
  name     = "credenly-backend-nestjs"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      # Usamos una imagen genérica inicial para evitar el problema del huevo y la gallina.
      # GitHub Actions actualizará la imagen con la real después de compilarla.
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      
      env {
        name  = "DB_HOST"
        value = google_compute_instance.db_instance.network_interface[0].network_ip
      }
      env {
        name  = "DB_PORT"
        value = "3306"
      }
      env {
        name  = "DB_USER"
        value = "credenly_user"
      }
      env {
        name  = "DB_PASSWORD"
        value = "credenly_password"
      }
      env {
        name  = "DB_NAME"
        value = "sistema_autenticacion"
      }

      liveness_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 10
        timeout_seconds       = 2
        period_seconds        = 5
        failure_threshold     = 3
      }
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# 10. Allow Public Access to Cloud Run (since it's a backend API)
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.backend.location
  project  = google_cloud_run_v2_service.backend.project
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "cloud_run_url" {
  value = google_cloud_run_v2_service.backend.uri
}
