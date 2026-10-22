import Image from "next/image";

const partners = [
  { src: "/assets/partners/logoMOEYS.png", alt: "Ministry of Education" },
  { src: "/assets/partners/logoRUPP.png", alt: "Royal University of Phnom Penh" },
  { src: "/assets/partners/logoUME.png", alt: "University of Management and Economics" },
  { src: "/assets/partners/logoTechMentor.png", alt: "Tech Mentor" },
  { src: "/assets/partners/logoLSIH.png", alt: "Life Skills Innovation Hub" },
];

export function PartnerStrip() {
  return (
    <section className="bg-white">
      <div className="container-page section-y">
        <p className="text-center text-base font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-lg">
          ទុកចិត្តដោយស្ថាប័ន និងដៃគូ
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 lg:gap-x-20">
          {partners.map((partner) => (
            <Image
              key={partner.src}
              src={partner.src}
              alt={partner.alt}
              width={200}
              height={80}
              className="h-14 w-auto object-contain opacity-75 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-16 lg:h-[4.5rem]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
