'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface DatenschutzData {
  intro: string;
  controller: string;
  dataCollected: string;
  purpose: string;
  hosting: string;
  cookies: string;
  rights: string;
  additionalInfo: string;
}

const fallbackDatenschutz: DatenschutzData = {
  intro: 'Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.',
  controller: 'Pizza Roma Siegen, [Inhaber Name], [Straße und Hausnummer], 57072 Siegen',
  dataCollected: 'Bei einer Bestellung erheben wir folgende Daten: Name, Lieferadresse, Telefonnummer, E-Mail-Adresse, Bestelldaten. Bei der Nutzung unserer Website werden zudem IP-Adresse, Browsertyp und -version, Betriebssystem und Zugriffszeiten automatisch erhoben.',
  purpose: 'Die Verarbeitung Ihrer Daten erfolgt zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Bereitstellung unserer Website und Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).',
  hosting: 'Unsere Website wird von Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Weitere Informationen finden Sie unter vercel.com/privacy.',
  cookies: 'Wir verwenden technisch notwendige Cookies, um den Betrieb der Website zu gewährleisten. Es werden keine Tracking-Cookies gesetzt, ohne dass Sie Ihre Einwilligung erteilt haben.',
  rights: 'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch (Art. 21 DSGVO). Kontakt: info@pizza-roma-siegen.de',
  additionalInfo: ''
};

export default function DatenschutzPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<DatenschutzData>(fallbackDatenschutz);

  useEffect(() => {
    fetch('/api/menu', { cache: 'no-store' })
      .then(res => res.json())
      .then(menuData => {
        if (menuData.legal?.datenschutz) {
          setData({ ...fallbackDatenschutz, ...menuData.legal.datenschutz });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-roma-dark py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-poppins font-bold text-white mb-8">Datenschutzerklärung</h1>
        
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6 text-white/80">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">1. Datenschutz auf einen Blick</h2>
            <p className="whitespace-pre-line">{data.intro}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">2. Verantwortliche Stelle</h2>
            <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="mt-2 font-medium text-white">{data.controller}</p>
            <p className="mt-1">Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">3. Datenerfassung auf dieser Website</h2>
            <p className="whitespace-pre-line">{data.dataCollected}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">4. Zweck der Datenverarbeitung</h2>
            <p className="whitespace-pre-line">{data.purpose}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">5. Hosting</h2>
            <p className="whitespace-pre-line">{data.hosting}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">6. Cookies</h2>
            <p className="whitespace-pre-line">{data.cookies}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">7. Ihre Rechte</h2>
            <p className="whitespace-pre-line">{data.rights}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">8. Aufbewahrungsdauer</h2>
            <p>Ihre personenbezogenen Daten werden nur so lange gespeichert, wie es für die Erfüllung der genannten Zwecke erforderlich ist oder wie es gesetzlich vorgeschrieben ist (Aufbewahrungsfristen nach HGB und AO können bis zu 10 Jahre betragen).</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">9. SSL-Verschlüsselung</h2>
            <p>Diese Seite nutzt aus Sicherheitsgründen eine SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von &quot;http://&quot; auf &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
          </div>

          {data.additionalInfo && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">10. Zusätzliche Informationen</h2>
              <p className="whitespace-pre-line">{data.additionalInfo}</p>
            </div>
          )}
        </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-roma-gold hover:underline">← Zurück zur Startseite</Link>
          </div>
          <div className="mt-4 text-center">
            <Link href="/impressum" className="text-sm text-white/50 hover:text-roma-gold mx-2">Impressum</Link>
            <span className="text-white/30">|</span>
            <Link href="/agb" className="text-sm text-white/50 hover:text-roma-gold mx-2">AGB</Link>
          </div>
      </div>
    </div>
  );
}
