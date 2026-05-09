# Memoria del Proyecto: Tienda y Plataforma de Coleccionismo Pokémon TCG

## 1. Introducción
* **Temática**: Desarrollo de una aplicación web full-stack dedicada a la simulación de una tienda, gestión de colecciones y apertura de sobres de cartas de Pokémon TCG.
* **Autor**: [Tu Nombre / Nombre del Estudiante]
* **Descripción breve**: El proyecto consiste en una plataforma interactiva que incluye un frontend en Vanilla JS, HTML y CSS, un backend en Java con Javalin, y una base de datos MySQL. Los usuarios pueden registrarse, comprar sobres, gestionar su carrito y visualizar su inventario, mientras que un administrador puede gestionar las cartas y las opciones globales de la tienda.

## 2. Motivación
* [Añadir motivación personal, por ejemplo: Aplicar y consolidar los conocimientos adquiridos a lo largo del curso en un proyecto real de principio a fin, unido al interés personal en la franquicia y el coleccionismo de cartas de Pokémon.]
* Necesidad de crear una plataforma centralizada y visualmente atractiva para la gestión digital del coleccionismo, unificando tienda y colección personal de forma intuitiva.

## 3. Análisis del sector y contexto en Canarias
* **Estudio de empresas y aplicaciones similares en Canarias**: Análisis de las tiendas locales de ocio alternativo (cómics, juegos de mesa) en Canarias que venden TCG y cómo sus plataformas digitales, cuando existen, son a menudo soluciones genéricas (plantillas CMS) poco inmersivas.
* **Tecnologías más utilizadas en el sector**: Uso generalizado de plataformas como WooCommerce, Shopify o PrestaShop por parte del comercio local, lo que resalta el valor de crear una solución tecnológica a medida y con control total de sus funcionalidades.
* **Contribución a los Objetivos de Desarrollo Sostenible (ODS)**:
    * *ODS 9 (Industria, Innovación e Infraestructura)*: Fomento de la digitalización del pequeño comercio.
    * *ODS 12 (Producción y Consumo Responsables)*: Alternativa de coleccionismo y apertura de sobres de manera virtual (digital), reduciendo el consumo de papel/cartón y plástico.
* **Innovación y aspectos singulares que pueden aportar valor añadido**: Implementación de recompensas diarias de inicio de sesión, un sistema de códigos de descuento personalizado (ej. "primercompra") y una experiencia de usuario (UX) inmersiva y adaptada a dispositivos móviles.
* **Análisis DAFO**:
    * **Debilidades**: Dependencia de servicios externos en la nube con posibles costes a largo plazo (base de datos en Aiven).
    * **Amenazas**: Competencia con plataformas oficiales (como Pokémon TCG Live) o grandes tiendas e-commerce ya establecidas.
    * **Fortalezas**: Aplicación desarrollada completamente a medida, ligera, sin dependencias excesivas en el frontend (Vanilla JS) y con un backend altamente eficiente (Java Javalin).
    * **Oportunidades**: Comunidad canaria muy activa y consolidada en los TCG; posibilidad de expansión tecnológica del modelo hacia otras franquicias de cartas.

## 4. Objetivos del proyecto
* **Objetivo general**: Diseñar, desarrollar y poner en producción una plataforma web interactiva, responsiva y segura para el coleccionismo e intercambio comercial simulado de cartas de Pokémon.
* **Objetivos específicos**:
    * Desarrollar un sistema de autenticación de usuarios y gestión de sesiones con seguridad.
    * Implementar un flujo completo de carrito de compras, actualización de saldos, registro de transacciones e inventario.
    * Diseñar una interfaz orientada al "Mobile First" (especialmente en páginas clave como el Perfil de usuario y el Panel de Administración).
    * Crear un panel de administración robusto para la actualización masiva de la base de datos de cartas y parametrización de la tienda.

## 5. Planificación y gestión del proyecto
* **Metodologías utilizadas durante el desarrollo**: Uso de desarrollo iterativo. División del proyecto en fases incrementales (ej. Fase de autenticación, Fase de carrito y checkout, Fase de panel de administración y configuración de perfil).
* **Planificación y control del tiempo**: [Mencionar herramientas usadas, ej. Trello, Jira, GitHub Projects, o método Kanban].
* **Comparación entre tiempo estimado y tiempo real**: [Espacio para incluir gráficas de horas previstas vs reales, o desviaciones encontradas. *Recuerda añadir tus evidencias visuales*].

## 6. Tecnologías y herramientas utilizadas
* **Lenguajes, frameworks, SGBD**:
    * **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6+).
    * **Backend**: Java (Javalin Framework, ideal para microservicios ligeros).
    * **Base de Datos**: MySQL (Cloud alojado en Aiven).
    * **Herramientas Adicionales**: Maven (gestión de dependencias backend), Git y Github para control de versiones.
* **Patrones software empleados**:
    * **Patrón Arquitectónico (Capas/MVC)**: Separación estricta en Controladores (`Controllers`), Lógica de Negocio (`Services`, como `InventoryService`, `TCGDexSyncService`) y Acceso a Datos (`DAOs` como `ExpansionDAO`). *Ventajas*: Mantenibilidad, escalabilidad y facilidad de depuración.
    * **Patrón Singleton**: Utilizado en la clase `DBConnection.java` para garantizar una única conexión persistente a la base de datos, optimizando recursos de conexión remota.

## 7. Estimación de recursos y presupuesto
* **Costes materiales y de software**:
    * Licencias de software y herramientas de desarrollo (IDE, SO).
    * Infraestructura cloud (Servidor Aiven MySQL, costes del servicio de hosting para el backend y frontend).
    * Costes de dominio web y certificados SSL.
* **Recursos humanos**: Estimación del coste de tus horas de desarrollo y diseño (Cálculo: Total horas de proyecto x tarifa base/hora de un desarrollador Junior Full-Stack).
* **Presupuesto total**: [Espacio para insertar una tabla resumen de costes estimados si el proyecto se vendiera a un cliente real].

## 8. Análisis
* **Identificación de stakeholders y perfiles de usuario**:
    * **Usuario Coleccionista/Cliente**: Visita la tienda, compra sobres, canjea recompensas diarias, visualiza su inventario y configura su perfil (cambio de email, contraseñas, etc).
    * **Administrador**: Realiza el mantenimiento de la base de datos, recarga cartas, supervisa y aprueba transacciones o descuentos.
* **Definición de requisitos**:
    * **Funcionales**: Autenticación, visualización de expansiones y cartas, carrito de compra, sistema de descuentos, recompensas diarias, sincronización de la API de TCG y panel de administración.
    * **No funcionales**: Interfaz "responsive" (que no colapsen modales o listados en smartphones), migración de `localStorage` a `sessionStorage` para mayor seguridad en el cierre de navegador, tiempos de carga optimizados.
    * **Restricciones**: Legales (RGPD, protección de contraseñas con hashing), Técnicas (uso del entorno específico Java/Vanilla JS).

## 9. Diseño del proyecto
* **Diseño visual**: [Definir aquí la paleta de colores empleada (ej. rojos y azules temáticos de Pokémon, tonos oscuros/claros), tipografías, y biblioteca de iconos].
* **Mockups, prototipos y bosquejos**: [Espacio para adjuntar los diseños previos o wireframes realizados en herramientas como Figma o Balsamiq].
* **Diagramas**:
    * **Casos de Uso (CU)**: Diagrama mostrando interacciones de Coleccionista vs Administrador.
    * **UML / Diagrama de Clases**: Estructura de las clases en Java.
    * **Entidad-Relación (E-R)**: Modelo relacional de la base de datos (relacionando `Users`, `Cards`, `Expansions`, `Inventory`, `Transactions`).

## 10. Documentación del proyecto
* **Documentación del código**: Comentarios de bloques clave en JavaScript y uso de JavaDoc en el backend. Estructuración coherente de directorios.
* **README**: Instrucciones completas sobre cómo clonar el repositorio, configuración de variables de entorno `.env` (credenciales de BD) y comandos para la ejecución de servidor y cliente.
* **Ayudas/guías y manual de usuario breve**: Guía paso a paso sobre cómo registrarse, añadir saldo, utilizar un código promocional, vender cartas del inventario y acceder al perfil. *Incluir capturas del flujo final*.

## 11. Pruebas
* **Tipos de pruebas realizadas**:
    * **Pruebas funcionales manuales**: Validación de los flujos del carrito, recompensas diarias, login/logout.
    * **Pruebas de interfaz (UI/UX)**: Tests específicos de scroll y visibilidad en ventanas modales (ej. en la confirmación de venta de cartas) en dispositivos de pantalla pequeña.
    * **Pruebas de base de datos**: Resolución de conflictos de integridad referencial (Foreign Keys) en actualizaciones masivas y chequeos de codificación de caracteres en los nombres de cartas.
* **Resultados y evidencias**: [Espacio para detallar la solución de bugs importantes encontrados y capturas de pantalla de las pruebas exitosas].

## 12. Despliegue del aplicativo
* **Repositorio**: Publicación y control de versiones en Github (incluir el enlace).
* **Despliegue**: [Explicar en qué plataformas se ha publicado: ej. Github Pages o Netlify para el frontend, y Railway, Render o servidor propio para el backend Java, junto con Aiven para la BD].

## 13. Uso de herramientas de Inteligencia Artificial
* **Herramientas de IA utilizadas**: Asistente de codificación y desarrollo agentico (Gemini 3.1 Pro / Antigravity), GitHub Copilot (si se usó).
* **Forma de utilización**: Apoyo continuo en depuración de código, resolución de conflictos complejos en bases de datos (sintaxis de SQL, bloqueos de claves foráneas), refactorización de CSS para "mobile responsive" y migración de lógicas de seguridad (Storage de sesión).
* **Ejemplos de prompts**:
    * *"Corregir los estilos en móviles de la página de perfil para evitar que el contenido colapse."*
    * *"Arreglar el error de sintaxis SQL al ejecutar actualizaciones en bloque en la tabla Cards saltando las claves foráneas."*
    * *"Implementar un sistema de recompensas diarias y códigos de descuento en el carrito."*
* **Evidencias del uso de IA**: [Adjuntar capturas del chat o extractos donde la IA aporta soluciones arquitectónicas y correcciones clave].

## 14. Conclusiones
* Reflexión final sobre el cumplimiento íntegro de los objetivos planteados.
* Resumen de las principales dificultades técnicas y cómo el enfoque investigativo (y el apoyo de IA) facilitaron su superación.
* Valoración personal y profesional de la consolidación de competencias "Full-Stack".

## 15. Vías futuras de desarrollo
* Incorporación de una pasarela de pago real (ej. Stripe o PayPal).
* Añadir un sistema de "Trading" interusuario (intercambio directo de cartas entre coleccionistas).
* Refactorizar el frontend actual hacia un framework reactivo (React o Vue.js) de cara a mayor escalabilidad de componentes.
* Desarrollo de una versión móvil en App nativa (Android/iOS).

## 16. Bibliografía y webgrafía (Formato APA 7.ª edición)
* Oracle. (s.f.). *Java 21 Documentation*. Recuperado de https://docs.oracle.com/en/java/javase/21/
* Javalin. (s.f.). *Javalin Framework Documentation*. Recuperado de https://javalin.io/documentation
* MDN Web Docs. (s.f.). *JavaScript, HTML y CSS Reference*. Recuperado de https://developer.mozilla.org/
* Aiven. (s.f.). *MySQL Cloud Documentation*. Recuperado de https://aiven.io/docs/products/mysql
* [Añadir otras fuentes, APIs consultadas o tutoriales...]
