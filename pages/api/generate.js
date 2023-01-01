import { Configuration, OpenAIApi } from 'openai';
import ip from 'ip';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// const basePromptPrefix = `
//   Give me a very detailed explanation of the following concept,
//   explaining it in clear terms and making it understandable by 5 year olds,
//   and also giving examples where applicable, and ending with a summary
// `;

const basePromptPrefix = `
  List at most 4 important topics that should be covered when explaining the following
  concept in simple and clear terms:

  Concept:
`;

const ABSTRACT_URL = 'https://ipgeolocation.abstractapi.com/v1/?api_key=' + process.env.ABSTRACT_API_KEY;

const doLog = async (userInput, country) => {
    const prompt = `Country: ${country} => Question: ${userInput}`;
    try {
	fetch(process.env.SLACK_HOOK_URL, {
	    method: 'POST',
            headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
            },
	    body: JSON.stringify({
		text: prompt
	    })
	});
    } catch(e) {
	console.error(e)
    }
};

const sendAPIRequest = async () => {
    const apiResponse = await fetch(ABSTRACT_URL);
    return apiResponse.json();
}


const generateAction = async (req, res) => {
  // Run first prompt
  if (req.method != 'POST') return res.status(404).json({ error: 'Route not found' });

    const ipAddressInformation = await sendAPIRequest();
    const country = ipAddressInformation?.country;
    const userInput = req.body.userInput;

    doLog(userInput, country);
    const baseCompletion = await openai.createCompletion({
	model: 'text-davinci-003',
	prompt: `${basePromptPrefix}${userInput}\n`,
	temperature: 0.4,
	max_tokens: 250,
    });

  const basePromptOutput = baseCompletion.data.choices.pop();

  const secondPrompt = `
    Using the following list of topics as guidelines, Give me a detailed explanation of ${userInput},
    explaining it in clear terms and making it understandable to 5 year olds without including the topics in the explanation.

    Topics: ${basePromptOutput.text}

    Explanation:
  `;

    const secondCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${secondPrompt}\n`,
      temperature: 0.4,
      max_tokens: 450,
    });

  const secondPromptOutput = secondCompletion.data.choices.pop();
  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;
