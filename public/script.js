const spinners = document.getElementById("load");
const send = document.getElementById("sendBtn");
const responseElement = document.getElementById("response");

// Agrega animacion de espera
send.addEventListener("click", async () => {
  spinners.classList.remove("hidden");
  
  // Limpiar respuesta previa
  responseElement.innerText = "Procesando...";
  
  await askQuestion();
});

async function askQuestion() {
  const question = document.getElementById("question").value;

  const textResponse = await fetch("/read-files");
  const { textContent } = await textResponse.json();

  // Enviar la pregunta
  const response = await fetch("/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, textContent }),
  });

  const data = await response.json();
  
  // Mostrar la respuesta solo una vez
  responseElement.innerText = data.answer;

  // Detiene animacion
  spinners.classList.add("hidden");
}
