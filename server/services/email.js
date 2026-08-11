export async function sendLoginCode(email, code) {
  const endpoint =
    process.env.FORMSPREE_ENDPOINT || "https://formspree.io/f/xjgnnlog";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      _subject: "Your HussaCinema sign-in code",
      message: `Your sign-in code is ${code}. It expires in 10 minutes. Do not share this code with anyone.`,
      code,
    }),
  });

  if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
}
