// import { EnvironmentLoader } from "../configs/environment";
// import { parse } from "pg-connection-string";
// import { execSync } from "child_process";

// // Parse command line arguments
// const direction = process.argv[2];

// if (!direction || !["local-to-cloud", "cloud-to-local"].includes(direction)) {
//   console.error('Invalid direction. Use "local-to-cloud" or "cloud-to-local".');
//   process.exit(1);
// }

// // Load environment
// const environmentLoader = EnvironmentLoader.getInstance();
// environmentLoader.loadEnvironment();

// // Tentukan source dan target
// const [sourceType, targetType] =
//   direction === "local-to-cloud" ? ["local", "cloud"] : ["cloud", "local"];

// // Dapatkan URL database
// const sourceUrl = environmentLoader.getDatabaseUrl(
//   sourceType as "local" | "cloud"
// );
// const targetUrl = environmentLoader.getDatabaseUrl(
//   targetType as "local" | "cloud"
// );

// // Parse URL
// const sourceConfig = parse(sourceUrl);
// const targetConfig = parse(targetUrl);

// // Generate nama file temporary
// const tempFile = `temp-${Date.now()}.sql`;

// try {
//   // 1. Dump database source
//   console.log(`Dumping ${sourceType} database...`);
//   execSync(
//     `pg_dump --clean --if-exists --host=${sourceConfig.host} ` +
//       `--port=${sourceConfig.port || "5432"} ` +
//       `--username=${sourceConfig.user} ` +
//       `--dbname=${sourceConfig.database} ` +
//       `--no-owner --no-privileges -f ${tempFile}`,
//     {
//       env: { ...process.env, PGPASSWORD: sourceConfig.password },
//       stdio: "inherit",
//     }
//   );

//   // 2. Restore ke database target
//   console.log(`Restoring to ${targetType} database...`);
//   execSync(
//     `psql --host=${targetConfig.host} ` +
//       `--port=${targetConfig.port || "5432"} ` +
//       `--username=${targetConfig.user} ` +
//       `--dbname=${targetConfig.database} ` +
//       `--file=${tempFile}`,
//     {
//       env: { ...process.env, PGPASSWORD: targetConfig.password },
//       stdio: "inherit",
//     }
//   );

//   console.log("✅ Sync completed successfully");
// } catch (error) {
//   console.error("❌ Sync failed:", error);
//   process.exit(1);
// } finally {
//   // Hapus file temporary
//   try {
//     execSync(`rm ${tempFile}`);
//   } catch (e) {
//     // Ignore error
//   }
// }
