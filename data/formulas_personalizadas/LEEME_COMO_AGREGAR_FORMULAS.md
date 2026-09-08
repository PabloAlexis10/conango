# 📂 Carpeta de Fórmulas Personalizadas (ConanGo)

¡Bienvenido! En esta carpeta puedes **pegar, actualizar o reemplazar** cualquiera de las 100 fórmulas oficiales de ConanGo.
El sistema lee esta carpeta con **prioridad máxima**: si colocas aquí un archivo para una fórmula (por ejemplo, la Fórmula 1 o la Fórmula 45), la aplicación usará tus preguntas inmediatamente.

---

## 🚀 ¿Cómo agregar o actualizar una fórmula?

1. Crea un archivo JSON nombrado con el número de la fórmula que deseas actualizar. Ejemplo:
   - `formula_1.json` (para la Fórmula 1)
   - `formula_5.json` (para la Fórmula 5)
   - `formula_23.json` (para la Fórmula 23)

2. Guarda dentro del archivo una lista de reactivos en formato JSON como el siguiente:

```json
[
  {
    "id": 1,
    "formula": 1,
    "type": "listening",
    "context": "The instructor told the cadets to assemble at the hangar.",
    "question": "Where should the cadets meet?",
    "options": [
      "At the dining hall",
      "At the hangar",
      "At the airfield runway",
      "In the barracks"
    ],
    "correctAnswer": 1,
    "textToSpeak": "The instructor told the cadets to assemble at the hangar. Where should the cadets meet?",
    "explanation": "The instructor clearly ordered them to assemble at the hangar."
  },
  {
    "id": 61,
    "formula": 1,
    "type": "reading",
    "question": "The sergeant ordered the squad ___ their gear immediately.",
    "options": [
      "to inspect",
      "inspecting",
      "inspected",
      "inspect of"
    ],
    "correctAnswer": 0,
    "explanation": "Infinitive structure: ordered someone to inspect."
  }
]
```

---

## 📋 Reglas de Estructura Oficial:
- **Listening**: Debe tener `"type": "listening"`, con `context` (situación que dirá el locutor), `question` (pregunta) y `options` (las 4 opciones).
- **Reading**: Debe tener `"type": "reading"`, con `question` y `options`.
- **correctAnswer**: Es el índice de la opción correcta:
  - `0` para la opción A
  - `1` para la opción B
  - `2` para la opción C
  - `3` para la opción D
- **Examen de 100 preguntas**: Si el archivo contiene 100 reactivos (60 de listening del 1 al 60, y 40 de reading del 61 al 100), la app los reproducirá en orden exacto y correlativo.
- **Quizzes rápidos (10, 20, 30, 50)**: La app seleccionará automáticamente preguntas aleatorias de tu archivo sin repetirlas.

---

## 🔄 ¿Cómo subir tus nuevas fórmulas a Vercel?
Una vez que pegues tus archivos JSON en esta carpeta:
1. Da doble clic en el archivo `actualizar-vercel.bat` ubicado en la raíz del proyecto.
2. O ejecuta en la consola:
   ```bash
   git add . ; git commit -m "Actualizar formulas en ConanGo" ; git push origin main
   ```
En 40 segundos tus nuevas fórmulas estarán disponibles en la nube para todos tus usuarios.
