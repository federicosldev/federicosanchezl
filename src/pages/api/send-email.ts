import type { APIRoute } from "astro"
import { Resend } from "resend"

export const POST: APIRoute = async ({ request }) => {
    try {
        const apiKey = import.meta.env.RESEND_API_KEY

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Error de configuración del servidor" }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            })
        }

        const resend = new Resend(apiKey)
        const formData = await request.formData()
        const email = formData.get("email")?.toString()
        const privacy = formData.get("privacy") === "on"

        if (!email || !privacy) {
            return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            })
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
            return new Response(JSON.stringify({ error: "Error al enviar el email" }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            })
        }

        return new Response(JSON.stringify({ success: true, message: "Suscripción exitosa" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }
}

