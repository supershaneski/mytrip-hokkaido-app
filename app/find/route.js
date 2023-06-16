import { chatCompletionFunc } from '../../service/openai'

export async function POST(request) {
    
    const { inquiry } = await request.json()

    if (!inquiry) {
        return new Response('Bad question', {
            status: 400,
        })
    }

    let response = null

    try {

        const messages = [
            { role: "user", content: inquiry }
        ]

        response = await chatCompletionFunc({
            messages, 
            functions: [
                {
                    name: "trip_planner",
                    description: "Suggest itinerary plan given a trip description and location.",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "The location of the trip, e.g. Hakodate, Sapporo"
                            },
                            description: {
                                type: "string",
                                description: "The description of the trip, e.g. day trip, night trip, cherry blossom viewing, hot spring"
                            }
                        },
                        required: ["location"]
                    }
                }
            ]
        })

        /*
        response = {
            content: null,
            function_call: {
                role: 'assistant',
                content: null,
                function_call: {
                name: 'trip_planner',
                arguments: '{\n  "location": "sapporo", "description": "day trip"\n}'
                }
            }
        }
        */

        console.log("received", response)

    } catch(error) {

        console.log(error)

    }

    return new Response(JSON.stringify({
        data: response,
    }), {
        status: 200,
    })
}