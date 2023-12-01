import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 60 * 1000
})

export async function embedding({
    input,
    model = 'text-embedding-ada-002',
    encoding_format = 'float'
}) {

    try {

        const result = await openai.embeddings.create({
            model,
            input,
            encoding_format
        })
        
        return result.data.map((d) => d.embedding)

    } catch(error) {

        console.log(error.name, error.message)

        throw error

    }
}

export async function chat({
    model = 'gpt-3.5-turbo-1106',
    max_tokens = 2048,
    temperature = 0,
    messages,
    tools,
    response_format,
}) {

    let options = { messages, model, temperature, max_tokens }

    if(tools) {
        options.tools = tools
    }

    if(response_format) {
        options.response_format = response_format // e.g. { "type": "json_object" }
    }

    try {

        const result = await openai.chat.completions.create(options)

        console.log(result)

        return result.choices[0]

    } catch(error) {
        
        console.log(error.name, error.message)
        
        throw error

    }
    
}

export async function whisper({
    file,
    model = 'whisper-1',
    prompt = '',
    response_format = 'json',
    temperature = 0,
    language = 'en',
}) {

    try {

        const response = await openai.audio.transcriptions.create({
            file,
            model,
            prompt,
            response_format,
            temperature,
            language,
        })
        
        return response

    } catch(error) {
        
        console.log(error.name, error.message)

        throw error
        
    }

}

export async function speech({
    model = 'tts-1',
    voice = 'alloy',
    input,
    filename,
}) {

    try {

        const mp3 = await openai.audio.speech.create({
            model,
            voice,
            input,
        })

        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(filename, buffer);

    } catch(error) {

        console.log(error.name, error.message)

        throw error

    }

}