import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Your cases data
const casesData = [
  {
    title: "Boehringer Ingelheim v. DYG",
    caseType: "Patent",
    industry: "Pharmaceuticals",
    year: 2023,
    description: "Patent infringement case",
    client: "Boehringer Ingelheim",
    opposingParty: "DYG",
    jurisdiction: "China (National)",
  },
  {
    title: "Apple Inc. v. Qualcomm",
    caseType: "Patent",
    industry: "Electronics",
    year: 2012,
    description: "SEP licensing disputes",
    client: "Apple Inc.",
    opposingParty: "Qualcomm",
    damages: "RMB1.6 billion",
    jurisdiction: "China (11 IP Courts, Provincial High Courts, Supreme People's Court)",
  },
  {
    title: "IWNCOMM v. Apple",
    caseType: "Patent",
    industry: "Telecommunications",
    year: 2020,
    description: "Patent infringement case",
    client: "Apple Inc.",
    opposingParty: "IWNCOMM (Xidian)",
    damages: "RMB150 million",
    jurisdiction: "Shaanxi High Court",
  },
  {
    title: "Apple Inc. v. IWNCOMM",
    caseType: "Patent",
    industry: "Telecommunications",
    year: 2020,
    description: "FRAND/SEP and anti-monopoly action",
    client: "Apple Inc.",
    opposingParty: "IWNCOMM",
    jurisdiction: "Beijing IP Court",
  },
  {
    title: "Astellas Inc. v. Generic Drug Companies",
    caseType: "Patent",
    industry: "Pharmaceuticals",
    year: 2015,
    description: "Patent infringement cases against generic drug manufacturers",
    client: "Astellas Inc.",
    opposingParty: "Multiple Chinese generic drug companies",
    damages: "MRB180+ million",
    jurisdiction: "Six IP Courts and High Courts in China",
  },
  {
    title: "Apple v. Baili",
    caseType: "Patent",
    industry: "Electronics",
    year: 2015,
    description: "Design patent infringement action",
    client: "Apple Inc.",
    opposingParty: "Baili",
    jurisdiction: "Beijing IP Court and BIPO",
  },
  {
    title: "iRobot v. Apple",
    caseType: "Patent",
    industry: "Electronics",
    year: 2018,
    description: "Patent infringement case",
    client: "Apple Inc.",
    opposingParty: "iRobot",
    jurisdiction: "China",
  },
  {
    title: "Watson Pharmaceutical v. Eli Lilly",
    caseType: "Patent",
    industry: "Pharmaceuticals",
    year: 2010,
    description: "Patent infringement lawsuit - Supreme Court reversal",
    client: "Watson Pharmaceutical Inc.",
    opposingParty: "Eli Lilly",
    damages: "RMB151 million",
    jurisdiction: "Supreme People's Court",
  },
  {
    title: "Power Integration v. Fairchild Semiconductor",
    caseType: "Patent",
    industry: "Electronics",
    year: 2012,
    description: "Multiple patent infringement cases in complex trials",
    client: "Power Integration",
    opposingParty: "Fairchild Semiconductor",
    jurisdiction: "China",
  },
  {
    title: "GoerTek v. Knowles",
    caseType: "Patent",
    industry: "Electronics",
    year: 2015,
    description: "Patent infringement lawsuit with novel settlement strategy",
    client: "Knowles",
    opposingParty: "GoerTek",
    jurisdiction: "China",
  },
  {
    title: "INEOS v. Sinopec",
    caseType: "Trade Secret",
    industry: "Chemical Engineering",
    year: 2010,
    description: "One of the largest trade secret cases in Chinese history",
    client: "INEOS",
    opposingParty: "Sinopec",
    jurisdiction: "China",
  },
  {
    title: "Dow v. Luxi Chemical",
    caseType: "Trade Secret",
    industry: "Chemical Engineering",
    year: 2015,
    description: "Breach of trade secret case",
    client: "Dow",
    opposingParty: "Luxi Chemical",
    damages: "US$102 million + injunction",
    jurisdiction: "China",
  },
  {
    title: "MECS v. Sinochem",
    caseType: "Trade Secret",
    industry: "Chemical Engineering",
    year: 2012,
    description: "Trade secret theft and infringement case",
    client: "MECS",
    opposingParty: "Sinochem",
    jurisdiction: "China",
  },
  {
    title: "Michael Jordan v. Qiaodan Sports",
    caseType: "Trademark",
    industry: "Sports & Fashion",
    year: 2010,
    description: "Successful claim to Chinese character mark Qiaodan",
    client: "Michael Jordan",
    opposingParty: "Qiaodan Sports",
    jurisdiction: "Multiple Chinese courts and Supreme People's Court",
  },
  {
    title: "New Balance v. Zhou",
    caseType: "Trademark",
    industry: "Fashion & Retail",
    year: 2015,
    description: "Trademark infringement and unfair competition dispute",
    client: "New Balance",
    opposingParty: "Zhou",
    damages: "RMB98 million reduced to RMB5 million",
    jurisdiction: "China",
  },
  {
    title: "Rolex v. Beijing Cinet",
    caseType: "Trademark",
    industry: "Luxury Goods",
    year: 2010,
    description: "Cybersquatting on trademark rights",
    client: "Rolex",
    opposingParty: "Beijing Cinet",
    jurisdiction: "Supreme People's Court",
  },
  {
    title: "NEC v. Multiple Defendants",
    caseType: "Trademark",
    industry: "Electronics",
    year: 2015,
    description: "Corporate identity theft case against 50+ defendants",
    client: "NEC",
    opposingParty: "50+ Chinese, Taiwanese, Hong Kong and Japanese defendants",
    jurisdiction: "Multiple Chinese courts",
  },
  {
    title: "Tesla v. Trademark Squatter",
    caseType: "Trademark",
    industry: "Automotive",
    year: 2015,
    description: "Cancellation of squatted trademarks and settlement",
    client: "Tesla",
    opposingParty: "Local trademark squatter",
    jurisdiction: "China",
  },
  {
    title: "Ralph Lauren v. Trademark Squatters",
    caseType: "Trademark",
    industry: "Fashion & Retail",
    year: 2010,
    description: "Multiple trademark infringement proceedings",
    client: "Ralph Lauren Corp.",
    opposingParty: "Multiple trademark squatters and infringers",
    jurisdiction: "China",
  },
  {
    title: "Apple v. App Store Infringers",
    caseType: "Copyright",
    industry: "Software & Digital",
    year: 2012,
    description: "Copyright infringement, trademark infringement, and unfair competition disputes",
    client: "Apple Inc.",
    opposingParty: "Multiple App Store infringers",
    jurisdiction: "Multiple Chinese courts",
  },
  {
    title: "Meizu v. Qualcomm",
    caseType: "Antimonopoly",
    industry: "Telecommunications",
    year: 2015,
    description: "Anti-trust and FRAND rate cases",
    client: "Meizu",
    opposingParty: "Qualcomm",
    jurisdiction: "China",
  },
];

async function importCases() {
  console.log(`Importing ${casesData.length} cases...`);

  for (const caseData of casesData) {
    try {
      console.log(`\nProcessing: ${caseData.title}`);

      // Generate enhanced description using AI
      const enhancedDescription = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `You are a legal expert specializing in IP litigation in China. Write a professional, 2-3 sentence case summary for:

Case: ${caseData.title}
Client: ${caseData.client}
Opposing Party: ${caseData.opposingParty}
Type: ${caseData.caseType}
Jurisdiction: ${caseData.jurisdiction}
${caseData.damages ? `Damages/Relief: ${caseData.damages}` : ""}
Original Description: ${caseData.description}

Write a compelling case summary highlighting the significance and outcome. Keep it professional and factual.`,
      });

      const { data, error } = await supabase.from("cases").insert([
        {
          title: caseData.title,
          client: caseData.client,
          opposing_party: caseData.opposingParty,
          case_type: caseData.caseType,
          industry: caseData.industry,
          year_filed: caseData.year,
          jurisdiction: caseData.jurisdiction,
          damages_awarded: caseData.damages || null,
          summary: caseData.description,
          full_analysis: enhancedDescription.text,
          status: "draft",
          significance_level: "landmark",
        },
      ]);

      if (error) {
        console.error(`Error inserting ${caseData.title}:`, error);
      } else {
        console.log(`✓ Added: ${caseData.title}`);
      }
    } catch (err) {
      console.error(`Error processing ${caseData.title}:`, err);
    }
  }

  console.log("\n✓ Import complete!");
}

importCases().catch(console.error);
