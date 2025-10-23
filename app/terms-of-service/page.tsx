import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/images/kalabasboom-logo.png"
              alt="Kalabasboom Logo"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Términos de Servicio</h1>
          <p className="text-gray-600">Última actualización: 23 de octubre de 2025</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar Kalabasboom ("el Servicio"), usted acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. 
              Si no está de acuerdo con lo anterior, por favor no utilice este servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Licencia de Uso</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Se otorga permiso para descargar temporalmente una copia de Kalabasboom por dispositivo para uso personal, 
              no comercial y transitorio únicamente. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>modificar o copiar los materiales;</li>
              <li>utilizar los materiales para cualquier propósito comercial o para cualquier exhibición pública;</li>
              <li>intentar realizar ingeniería inversa de cualquier software contenido en Kalabasboom;</li>
              <li>eliminar cualquier derecho de autor u otras notaciones de propiedad de los materiales.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cuentas de Usuario</h2>
            <p className="text-gray-700 leading-relaxed">
              Para acceder a ciertas características del Servicio, debe registrarse para una cuenta utilizando un código de acceso válido. 
              Usted es responsable de salvaguardar la contraseña y todas las actividades que ocurran bajo su cuenta. 
              Nos reservamos el derecho de rechazar el servicio, cancelar cuentas, o cancelar pedidos a nuestra sola discreción.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Política de Privacidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo recopilamos, utilizamos y protegemos su información 
              cuando utiliza nuestro Servicio. Al utilizar nuestro Servicio, usted acepta la recopilación y uso de información de acuerdo con nuestra Política de Privacidad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Usos Prohibidos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">No puede utilizar nuestro Servicio:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Para cualquier propósito ilegal o para solicitar a otros que realicen acciones ilegales;</li>
              <li>Para violar cualquier regulación, regla, ley internacional, federal, provincial o estatal u ordenanza local;</li>
              <li>Para infringir o violar nuestros derechos de propiedad intelectual o los derechos de propiedad intelectual de otros;</li>
              <li>Para acosar, abusar, insultar, dañar, difamar, calumniar, menospreciar, intimidar o discriminar;</li>
              <li>Para enviar información falsa o engañosa.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Disponibilidad del Servicio</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de retirar o modificar nuestro Servicio, y cualquier servicio o material que proporcionemos, 
              a nuestra sola discreción sin previo aviso. No seremos responsables si por cualquier razón todo o cualquier parte del Servicio 
              no está disponible en cualquier momento o por cualquier período.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              En ningún caso Kalabasboom o sus proveedores serán responsables por cualquier daño (incluyendo, sin limitación, 
              daños por pérdida de datos o beneficios, o debido a interrupción del negocio) que surja del uso o la incapacidad de usar 
              los materiales en Kalabasboom, incluso si Kalabasboom o un representante autorizado de Kalabasboom ha sido notificado 
              oralmente o por escrito de la posibilidad de tal daño.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Información de Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene alguna pregunta sobre estos Términos de Servicio, por favor contáctenos en:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">Email: soporte@kalabasboom.com</p>
              <p className="text-gray-700">Dirección: [Su Dirección Comercial]</p>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/">
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}