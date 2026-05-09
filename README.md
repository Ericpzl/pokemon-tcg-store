# Pokémon TCG Store & Collector

Una plataforma web full-stack para gestionar una colección de cartas de Pokémon TCG, simular la compra de sobres y administrar tu propio inventario.

## 🚀 Características Principales
- **Tienda y Carrito**: Explora expansiones y compra sobres virtuales.
- **Inventario**: Visualiza tu colección personal de cartas y véndelas para obtener saldo.
- **Recompensas**: Recibe recompensas diarias al iniciar sesión y aplica códigos de descuento en el carrito.
- **Panel de Administración**: Sincroniza la base de datos de cartas y gestiona el inventario global.
- **Perfil de Usuario**: Actualiza tus credenciales y visualiza tu estado.

## 🛠️ Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6+).
- **Backend**: Java 21+, Javalin Framework.
- **Base de Datos**: MySQL (Hospedado en Aiven Cloud).
- **Gestión de Dependencias**: Maven.

## 📋 Requisitos Previos
Para poder ejecutar este proyecto en tu máquina local, necesitarás tener instalado:
- **Java Development Kit (JDK) 21** o superior.
- **Maven** (usualmente ya viene integrado en IDEs modernos como IntelliJ IDEA, Eclipse o VS Code).
- **Extensión Live Server** en Visual Studio Code (o cualquier servidor web local para servir el Frontend).

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd pokemon-tcg-project
   ```

2. **Configuración de la Base de Datos**:
   * El proyecto se conecta a una base de datos MySQL en la nube (Aiven).
   * Asegúrate de configurar correctamente las variables de entorno o las credenciales dentro de la clase `DBConnection.java` en el backend (URL, Usuario, Contraseña).

3. **Carga del Backend**:
   * Abre la carpeta `/backend` usando tu entorno de desarrollo favorito (recomendado: IntelliJ IDEA o VS Code con el Extension Pack for Java).
   * Deja que Maven sincronice y descargue todas las dependencias del archivo `pom.xml`.

## 🏃‍♂️ Cómo Ejecutar el Proyecto

### 1. Iniciar el Servidor Backend (Java)
* Localiza el archivo principal donde se configura e inicia Javalin.
* Ejecuta la aplicación. La consola mostrará un mensaje indicando que el servidor Javalin se ha iniciado, habitualmente en `http://localhost:7070`.

### 2. Iniciar el Cliente Frontend
* Abre la carpeta `/frontend` en Visual Studio Code.
* Haz clic derecho sobre el archivo `index.html` y selecciona **"Open with Live Server"**.
* Esto abrirá automáticamente tu navegador por defecto (normalmente en `http://127.0.0.1:5500`) mostrando la página de inicio.

## 🎮 Guía Rápida de Uso

1. **Registro e Inicio de Sesión**: Comienza creando una cuenta nueva y loguéate en la plataforma.
2. **Reclama tu Recompensa**: Al iniciar sesión diariamente, verás un aviso de recompensa en tu panel.
3. **Compra en la Tienda**: Navega por la tienda, selecciona los sobres que te gusten, añádelos al carrito y completa la transacción. (¡Prueba a usar códigos promocionales si el administrador ha creado alguno, por ejemplo `primercompra`!).
4. **Gestiona tu Inventario**: Ve a tu perfil/inventario para descubrir las cartas que te han tocado en los sobres. Desde aquí también podrás vender cartas repetidas.
5. **Panel de Admin**: Si tu cuenta tiene permisos de administrador, verás el acceso al panel donde puedes actualizar la base de datos de cartas y ver estadísticas globales.

## 👨‍💻 Autor
**[Dolores Frugoni López, Eric Pérez León]**
Proyecto de Fin de Ciclo