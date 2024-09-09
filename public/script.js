const spinners = document.getElementById("load");
const send = document.getElementById("sendBtn");

// Agrega animacion de espera
send.addEventListener("click", async () => {
  spinners.classList.remove("hidden");
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
  document.getElementById("response").innerText = data.answer;

  // Detiene animacion
  spinners.classList.add("hidden");
}
