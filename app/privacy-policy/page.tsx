import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
          <p className="text-gray-600">Última actualización: 23 de octubre de 2025</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información que Recopilamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, utiliza nuestros servicios o se comunica con nosotros para obtener soporte.
            </p>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Información Personal:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Nombre, dirección de correo electrónico y número de teléfono</li>
              <li>Nombre de la organización e información empresarial</li>
              <li>Información del perfil y preferencias</li>
              <li>Información de pago y facturación</li>
            </ul>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Información de Uso:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Datos de registro e información del dispositivo</li>
              <li>Patrones de uso e interacciones con características</li>
              <li>Datos de diagnóstico y rendimiento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cómo Utilizamos Su Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Utilizamos la información que recopilamos para:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar información relacionada</li>
              <li>Enviar avisos técnicos, actualizaciones y mensajes de soporte</li>
              <li>Responder a sus comentarios, preguntas y solicitudes de atención al cliente</li>
              <li>Comunicarnos con usted sobre productos, servicios, ofertas y eventos</li>
              <li>Monitorear y analizar tendencias, uso y actividades</li>
              <li>Detectar, investigar y prevenir transacciones fraudulentas y otras actividades ilegales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartir Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartir información sobre usted en las siguientes situaciones:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Con su consentimiento:</strong> Podemos compartir información con su consentimiento explícito</li>
              <li><strong>Proveedores de servicios:</strong> Podemos compartir información con proveedores, consultores y otros prestadores de servicios externos</li>
              <li><strong>Requisitos legales:</strong> Podemos divulgar información en respuesta a procesos legales o solicitudes gubernamentales</li>
              <li><strong>Transferencias comerciales:</strong> La información puede transferirse en relación con fusiones, adquisiciones o ventas de activos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Seguridad de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas técnicas y organizacionales apropiadas para proteger su información personal contra acceso no autorizado, 
              alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por internet o almacenamiento electrónico es 100% seguro, 
              por lo que no podemos garantizar seguridad absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Almacenamos la información que recopilamos sobre usted durante el tiempo que sea necesario para el/los propósito(s) para el/los cual(es) originalmente la recopilamos. 
              Podemos retener cierta información para propósitos comerciales legítimos o según lo requiera la ley.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Sus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dependiendo de su ubicación, puede tener ciertos derechos con respecto a su información personal:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Acceso:</strong> Solicitar acceso a su información personal</li>
              <li><strong>Corrección:</strong> Solicitar corrección de información personal inexacta</li>
              <li><strong>Eliminación:</strong> Solicitar eliminación de su información personal</li>
              <li><strong>Portabilidad:</strong> Solicitar una copia de su información personal en formato estructurado</li>
              <li><strong>Objeción:</strong> Objetar el procesamiento de su información personal</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies y tecnologías similares para proporcionar, proteger y mejorar nuestros servicios. 
              Las cookies nos ayudan a recordar sus preferencias, entender cómo utiliza nuestros servicios y personalizar su experiencia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferencias Internacionales de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Su información puede ser transferida y procesada en países distintos al suyo. 
              Nos aseguramos de que existan salvaguardas apropiadas para proteger su información personal cuando se transfiere internacionalmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cambios a Esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página 
              y actualizando la fecha de "Última actualización". Le recomendamos revisar esta Política de Privacidad periódicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contáctenos</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos en:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">Email: privacidad@kalabasboom.com</p>
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