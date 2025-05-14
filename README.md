# Collaborative Chat and Document Editor

## Descripción del Proyecto

Esta aplicación web, desarrollada con React y TypeScript, permite a múltiples usuarios colaborar en tiempo real en un chat y un editor de documentos. Utiliza WebSocket para sincronizar mensajes y ediciones instantáneamente. Las funcionalidades incluyen:

- Chat en tiempo real con auto-scroll.
- Editor de documentos colaborativo con actualizaciones en tiempo real.
- Historial de ediciones del documento, descargable como .txt.
- Descarga del historial de chat y documento actual como .txt.
- Autenticación básica vía localStorage.
- Interfaz con barra lateral para exportar datos y cerrar sesión.

El backend (no incluido) debe estar en http://localhost:4000, con endpoints /api/chat, /api/document, y WebSocket en ws://localhost:4000.

## Tecnologías Utilizadas

- Frontend: React, TypeScript, React Router, Tailwind CSS (implícito en clases CSS).
- Comunicación: WebSocket.
- Almacenamiento: localStorage para autenticación y nombre de usuario.

## Prerrequisitos

- Node.js (v16 o superior): https://nodejs.org/
- npm (incluido con Node.js) o yarn (opcional).
- Servidor backend en http://localhost:4000 con endpoints /api/chat, /api/document y WebSocket ws://localhost:4000.
## Backend server
- Backend repo: ```https://github.com/akishajae/M06-ChatBack.git```

## Instalación de Dependencias

1. Clona el repositorio (o copia el código):

2. Instala dependencias:

``` bash
npm install
```

## Arrancar el chat

``` bash
npm run dev
```


