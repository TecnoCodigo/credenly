describe('Flujo de Autenticación', () => {
  it('debería mostrar error con credenciales incorrectas', () => {
    cy.visit('/login')
    cy.get('input[name="usuario"]').type('admin')
    cy.get('input[name="clave"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    // Dependiendo de tu UI, verifica que se muestre un mensaje de error
    cy.contains('Usuario o contraseña incorrectos').should('be.visible')
  })

  it('debería hacer login exitoso y redirigir al perfil', () => {
    cy.visit('/login')
    cy.get('input[name="usuario"]').type('admin')
    cy.get('input[name="clave"]').type('Password123!')
    // Stub the API call
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        refresh_token: 'fake-refresh-token',
        user: { id: 1, usuario: 'admin', nombre: 'Admin User' }
      }
    }).as('loginRequest')
    
    cy.get('button[type="submit"]').click()
    cy.wait('@loginRequest')

    // Verificar que redirigió al perfil
    cy.url().should('include', '/perfil') // O la ruta a la que redirija, ej. /profile
  })
})
