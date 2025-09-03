# Configuración de Discord OAuth para CreatorLab

## Información del Servidor
- **Server ID**: 1329871528627540170
- **Bot Client ID**: 1376568246219837511
- **Bot Client Secret**: Z34UpKETLXsx9FqFAZ3JtElS21UDhliF
- **Enlace de Invitación**: https://discord.gg/h77v7P37G3

## Configuración en Discord Developer Portal

### 1. Crear una Aplicación de Discord
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación llamada "CreatorLab"
3. Ve a la sección "OAuth2" en el menú lateral

### 2. Configurar OAuth2
En la sección OAuth2:

**Redirects:**
- Agrega: `http://localhost:4322/auth/callback`
- Agrega: `https://tu-dominio.com/auth/callback` (cuando tengas dominio)

**Scopes:**
- `identify` - Para obtener información básica del usuario
- `email` - Para obtener el email del usuario
- `guilds` - Para obtener información de servidores (opcional)

### 3. Configurar en Supabase
1. Ve a tu proyecto en Supabase Dashboard
2. Ve a Authentication > Providers
3. Habilita Discord
4. Configura:
   - **Client ID**: El Client ID de tu aplicación Discord
   - **Client Secret**: El Client Secret de tu aplicación Discord
   - **Redirect URL**: `https://tu-proyecto.supabase.co/auth/v1/callback`

### 4. Variables de Entorno
Asegúrate de que tu archivo `.env` tenga:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Diferencias Importantes

### Servidor de Discord vs OAuth
- **Servidor de Discord**: Es donde los usuarios se unen para interactuar con la comunidad
- **Discord OAuth**: Es para autenticación y vincular cuentas de Discord a tu web

### Flujo de Usuario
1. Usuario se registra/inicia sesión en CreatorLab
2. Ve el botón "Discord" en el navbar (para unirse al servidor)
3. Puede conectar su cuenta de Discord desde el UserMenu
4. Al conectar Discord, obtienes acceso a su información de perfil

## Funcionalidades Implementadas

### En el Navbar
- Botón "Discord" visible solo cuando el usuario está logueado
- Lleva directamente al servidor de Discord

### En el UserMenu
- Opción "Conectar Discord" para vincular cuenta
- Opción "Unirse al Servidor" como alternativa
- Opción "Desconectar Discord" si ya está conectado

## Próximos Pasos
1. Configura Discord OAuth en el Developer Portal
2. Actualiza la configuración en Supabase
3. Prueba el flujo de autenticación
4. Considera agregar roles automáticos en el servidor basados en suscripciones 