import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://tagverseiio_db_user:rOpwHr5WqhHJL7lr@tsk.ww6wcoc.mongodb.net/?appName=TSK";
const client = new MongoClient(uri);

const mediaData: Record<string, string[]> = {
  "kree": [
    "1Tj1Seu-KXGnfQuaB8CfPRfkqiDcPn28Q",
    "1hY2RjPBD_GW7Gf1OJpj-hcmEk-o5TRL8",
    "1Iil0kfSSUDogkAwa26C1Qkfjq8LtgVQ1",
    "1JOpNLQOshZZTSx9JZC6bognwIBhLjR4q",
    "1krACC-5GD0sfRMk3lgebaXERdqbR3M_0",
    "16LaK5NCKjtOjS-l5TSzFgm3BWtvn-NHO",
    "1ttoUn2MMlJNGepaKAiwmMOu83a7YIaM2",
    "1Q3XSzUg7kK3IDoY4WlpqHl3SCkVt07O0"
  ],
  "diamond-pearl": [
    "1Wjiw9yv7rruNtgkGbkwtoxksIaCBqdsr",
    "1Bn3u3VjIGhn28D0ZGupK0_BH5Opdh24O",
    "1-GbBJEg7ZeDpib2YRLWu3Rgcfhx1G-03",
    "12S2TZcJcssbhFEx42gu5jR1jGzlPJKUy",
    "1q5xDwO5zfWx268UcZirUtaOhel-a3t70",
    "1bL-xFHHoKzqfEpGpiiKUychwZ64JAcIn",
    "1-nJLvBemwm2tyNRNdI1bFJgkZEIpV9_U"
  ],
  "ruchi": [
    "13bhFDp7y38CH4y0p_x8EfnXcaG50LQ4b",
    "1wyxi7Bsx2HbmZP5g40bopBGb5t5r42v7",
    "13qtyM-hPKwt76pI-wS05QrsO40NHEx8d",
    "1EIOqwQo9FzCmhBwhEsnOIx03UI56Ilq-"
  ],
  "super-deluxe": [
    "1tI82sV5GdFDqfoA35nj6EPNCfrN7f_ay",
    "1WWNs9uNOHijy-3obikNUMR-IoIHtHSbw",
    "1ZKHSkIM4nj-Patnhyim0QyvAXIFr2JIN",
    "1KOA-wi0NjMQZmE7QWhifc1v4EhEYl7IR",
    "1X0a24C9iB6j0dRV7i03iu49fo9lBs75Y",
    "1rbfB5msN4sEAWcWkJVvW_dv32kqDSxSQ",
    "1h8PhCfvFkuzMx0fqm5hYVKsnG5qAzDoN"
  ],
  "dnet": [
    "1397BGpaAO6YxEl-EzaVIYvYsILkBv1WJ",
    "1qQxsBfyVsxJWdyMOZAVUk8s7OHMHwMMb",
    "16Soi6_ZyQYeBdqiId06FgING5SQfEP_D",
    "1J01a8XVKMh9EyA5p_Nbge6lpQ60TFG5m",
    "1FoRue71qiKjFuZocfTezEInn18Q1REL8",
    "1gGvdrrtSFQB0qV28CvObgvK1QEbR-6p7",
    "18OO8AqDtDrn3g0XOpMDWH2EXQgrZQYR6",
    "1O2F4W6PKAHSkqKl9fCnsqpU8phr4aFER"
  ],
  // These ones are not currently in the DB but I will add them in case you create them later
  "goa": [
    "1-Bps3BIsH97DGIN_Ab_dzYzU0qoEGmnC",
    "10MrQnmU-UKzbHmImh801bmBqaA5GMiBD",
    "1-n73njpJSoVF74MrZPmGoMnj2DN9Q_t_",
    "1EzgzUirlrdUmXVu1NS84ukvWrZ4IPH8p",
    "12tmr3B-5h53yEb4qa06OiUTLrs0FYOub",
    "1fPhSUU06C9kwuGT4-0YgRF9gGtM1J5oH",
    "1l4sxs1H-XORhevLQkvgq_Nwv1gtXKRTX"
  ],
  "mix-master": [
    "1rnhSHM-12rgPvw12aRJqHixb5gG3mhwN",
    "1vnL4MK9RW620Ekkhb1s6CfjDe6G6qxb5",
    "1PeC8ge5TR5VaEQ-xEj8qxUj4sRI_IB0b",
    "1Hr3FIADWNW0EZxTUYDNwVzET85ACwsSe"
  ],
  "soora": [
    "1yPU3DzFPiXL_8HtgKBEh_ZtZjwPl-zCp",
    "1kLbWgeJaVI5TcmSeeLkd9gbs-ojZt6D9",
    "1VFdtkHjMDk0IaO39z-DR2XIeyo6ybmpv"
  ],
  "simmasanam": [
    "1hD84hwMiHbe_zA1G_yhtjuRQ5TDYWwAp",
    "1LmVCYGtraJcPvXsZkzu4eJ3uP5OdxTd_"
  ],
  "best-perfume": [
    "1Mnj9WGKPEnqGuUEmm7cby6lE3QwH-IKD",
    "1J6xOC84dhazr9ciBOnZolbF2kE9cF3lK"
  ]
};

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("TSK");
    const caseStudies = db.collection("caseStudies");

    for (const [slug, ids] of Object.entries(mediaData)) {
      const mediaItems = ids.map(id => ({
        type: "video", // Defaulting to video based on streaming requirement
        src: id
      }));

      const result = await caseStudies.updateOne(
        { slug: slug },
        { $set: { media: mediaItems } }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated case study '${slug}' with ${mediaItems.length} media items.`);
      } else {
        console.log(`⚠️ Case study '${slug}' not found in the database. Skipped.`);
      }
    }

    console.log("\nNote: Chuan Watch and All Madras Barbers were provided as folders. You will need to extract the individual image IDs or use a Google Drive API script to fetch them.");

  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}

run();
