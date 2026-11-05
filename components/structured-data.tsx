export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": "https://gao.law/#organization",
    "name": "Gao.Law",
    "alternateName": "高点法",
    "url": "https://gao.law",
    "logo": "https://gao.law/logo.png",
    "description": "Premier intellectual property litigation practice in China serving Fortune 500 companies. Specializing in patent litigation, trademark protection, trade secret cases, and cross-border IP enforcement.",
    "foundingDate": "2010",
    "founder": {
      "@type": "Person",
      "name": "Thomas Gao",
      "jobTitle": "Founding Partner"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "China"
      },
      {
        "@type": "Country", 
        "name": "United States"
      }
    ],
    "serviceType": [
      "Patent Litigation",
      "Trademark Protection",
      "Trade Secret Cases",
      "IP Due Diligence",
      "SEP/FRAND Disputes",
      "Cross-border IP Enforcement"
    ],
    "knowsAbout": [
      "Chinese Patent Law",
      "Chinese Trademark Law",
      "CNIPA Proceedings",
      "Supreme People's Court IP Cases",
      "Standard Essential Patents",
      "FRAND Licensing"
    ],
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Notable Cases",
        "name": "INEOS v. Sinopec - Largest patent damages award in Chinese history ($26M)"
      },
      {
        "@type": "EducationalOccupationalCredential", 
        "credentialCategory": "Notable Cases",
        "name": "Michael Jordan v. Qiaodan Sports - Landmark Supreme Court trademark victory"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Notable Cases", 
        "name": "Apple v. Qualcomm - High-profile SEP/FRAND dispute"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Notable Cases",
        "name": "Boehringer v. HEC Pharma - Only National Major Patent Infringement case to date"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/gaolaw"
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://gao.law/#website",
    "url": "https://gao.law",
    "name": "Gao.Law - IP Litigation in China",
    "description": "Premier intellectual property litigation practice in China",
    "publisher": {
      "@id": "https://gao.law/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gao.law/cases?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://gao.law/#service",
    "name": "Gao.Law IP Litigation Services",
    "provider": {
      "@id": "https://gao.law/#organization"
    },
    "serviceType": "Intellectual Property Litigation",
    "areaServed": {
      "@type": "Country",
      "name": "China"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "IP Legal Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Patent Litigation",
            "description": "Complex patent disputes including infringement, validity challenges, and SEP licensing before Chinese courts and CNIPA"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Trademark Protection",
            "description": "Registration, enforcement, opposition proceedings, and litigation against infringers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Trade Secret Protection",
            "description": "Civil litigation, criminal prosecution coordination, and preventive measures"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "SEP/FRAND Disputes",
            "description": "Standard essential patent licensing negotiations and litigation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "IP Due Diligence",
            "description": "Comprehensive IP assessment for M&A, technology transfers, and investments"
          }
        }
      ]
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
    </>
  )
}
