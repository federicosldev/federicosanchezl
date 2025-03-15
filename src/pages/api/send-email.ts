import type { APIRoute } from "astro"
import { Resend } from "resend"

export const POST: APIRoute = async ({ request }) => {
    try {
        const resend = new Resend(import.meta.env.RESEND_API_KEY)
        const formData = await request.formData()
        const email = formData.get("email")?.toString()
        const privacy = formData.get("privacy") === "on"

        if (!email || !privacy) {
            return new Response("Faltan campos requeridos", { status: 400 })
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
            return new Response("Error al enviar el email", { status: 500 })
        }

        return new Response("Suscripción exitosa")
    } catch (error) {
        console.error("Error del servidor:", error)
        return new Response("Error interno del servidor", { status: 500 })
    }
}

