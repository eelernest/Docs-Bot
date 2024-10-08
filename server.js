import express from "express";
import mammoth from "mammoth";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Función para leer todos los archivos DOCX en la carpeta
async function loadAllDocx(folderPath) {
  const files = fs.readdirSync(folderPath);
  let combinedText = "";

  for (const file of files) {
    if (file.endsWith(".docx")) {
      const filePath = `${folderPath}/${file}`;
      try {
        const text = await loadDocx(filePath);
        combinedText += text + "\n"; // Concatena
      } catch (error) {
        console.error(
          `Error al procesar el archivo ${filePath}: ${error.message}`
        );
        // Se puede registrar el error o hacer otra cosa
      }
    }
  }

  return combinedText;
}

// Lee y combina todos los archivos Word
let cachedTextContent = null;

app.get("/read-files", async (req, res) => {
  if (!cachedTextContent) {
    cachedTextContent = await loadAllDocx("./files"); // Cargar solo la primera vez
  }
  res.json({ textContent: cachedTextContent });
});


// Ruta para hacer la consulta a OpenAI
// Consulta OpenAI
app.post("/ask", express.json(), async (req, res) => {
  const question = req.body.question;
  const textContent = req.body.textContent;

  // URL de la API de OpenAI
  const openaiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    // Petición a la API de OpenAI
    const response = await fetch(
      openaiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Usar clave de OpenAI
        },
        body: JSON.stringify({
          model: "gpt-4",  // Modelo de OpenA
          messages: [
            {
              role: "system",
              content:
                "Eres un bot que resuelve dudas a la medida, amable y cortes. Lee toda la pregunta y contesta con base al texto",
            },
            { role: "user", content: `${textContent}\n\nPregunta: ${question}` },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();
    
    // Imprime la respuesta completa para depuración
    console.log('Respuesta de la API de OpenAI:', data);

    // Verifica que la respuesta tenga el formato esperado
    if (data.choices && data.choices.length > 0) {
      res.json({ answer: data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: "No se recibió una respuesta válida de OpenAI" });
    }
  } catch (error) {
    console.error('Error al consultar OpenAI:', error);
    res.status(500).json({ error: "Error al consultar OpenAI" });
  }
});



// Consulta LLM STUDIO
/* app.post("/ask", express.json(), async (req, res) => {
  const question = req.body.question;
  const textContent = req.body.textContent;

  let gptComplementions = '/v1/chat/completions'
  let localUrl = 'http://localhost:8000'+gptComplementions
  let ngrokUrl = 'https://c7ae-2806-2a0-e26-8120-9113-54ee-4c59-5ca5.ngrok-free.app'+gptComplementions

  const response = await fetch(
    ngrokUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_STUDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "TheBloke/OpenHermes-2.5-Mistral-7B-GGUF",
        messages: [
          {
            role: "system",
            content:
              "Eres un bot que resuelve dudas a la medida, amable y cortes. Lee toda la pregunta y contesta con base al texto",
          },
          { role: "user", content: `${textContent}\n\nPregunta: ${question}` },
        ],
        temperature: 0.7,
      }),
    }
  );

  const data = await response.json();
  res.json({ answer: data.choices[0].message.content.trim() });
}); */

// Función para leer DOCX
async function loadDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
