import type { APIRoute } from "astro"
import { Resend } from "resend"

// Handle OPTIONS request for CORS
export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
        },
    })
}

// Handle POST request
export const POST: APIRoute = async ({ request }) => {
    // Add CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    try {
        const apiKey = import.meta.env.RESEND_API_KEY

        if (!apiKey) {
            console.error("RESEND_API_KEY no está configurada")
            return new Response(JSON.stringify({ error: "Error de configuración del servidor: Falta API key" }), {
                status: 500,
                headers,
            })
        }

        const resend = new Resend(apiKey)

        let formData
        try {
            formData = await request.formData()
        } catch (error) {
            console.error("Error al procesar FormData:", error)
            return new Response(JSON.stringify({ error: "Error al procesar el formulario" }), { status: 400, headers })
        }

        const email = formData.get("email")?.toString()
        const privacy = formData.get("privacy") === "on"

        if (!email || !privacy) {
            return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), { status: 400, headers })
        }

        const { data, error } = await resend.emails.send({
            from: "Federico Sanchez <contacto@federicosanchezl.com>",
            to: ["sanchezlisonfederico2001@gmail.com"],
            subject: "Nueva suscripción",
            reply_to: email,
            html: `
        <h2>Nueva Suscripción</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Aceptó política de privacidad:</strong> Sí</p>
      `,
        })

        if (error) {
            console.error("Error de API Resend:", error)
            return new Response(JSON.stringify({ error: `Error al enviar el email: ${error.message}` }), {
                status: 500,
                headers,
            })
        }

        return new Response(JSON.stringify({ message: "Suscripción exitosa" }), { status: 200, headers })
    } catch (error) {
        console.error("Error del servidor:", error)
        return new Response(
            JSON.stringify({
                error: `Error interno del servidor: ${error instanceof Error ? error.message : String(error)}`,
            }),
            { status: 500, headers },
        )
    }
}

// Handle all other HTTP methods
export const all: APIRoute = async () => {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
        status: 405,
        headers: {
            "Access-Control-Allow-Origin": "*",
            Allow: "POST, OPTIONS",
        },
    })
}

