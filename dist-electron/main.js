"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const child_process = require("child_process");
const util = require("util");
const crypto = require("crypto");
const node_crypto = require("node:crypto");
const tar = require("tar");
const STEAM_PATHS = [
  "C:\\Program Files (x86)\\Steam",
  "C:\\Program Files\\Steam",
  path.join(os.homedir(), "Steam"),
  "D:\\Steam",
  "E:\\Steam",
  "D:\\SteamLibrary",
  "E:\\SteamLibrary"
];
function findSteamPath() {
  for (const path$1 of STEAM_PATHS) {
    if (fs.existsSync(path.join(path$1, "steamapps", "libraryfolders.vdf"))) {
      return path$1;
    }
  }
  return null;
}
function parseVdf(content) {
  const result = {};
  const lines = content.split("\n");
  const stack = [result];
  let currentKey = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) continue;
    if (trimmed === "{") {
      const newObj = {};
      stack[stack.length - 1][currentKey] = newObj;
      stack.push(newObj);
      continue;
    }
    if (trimmed === "}") {
      stack.pop();
      continue;
    }
    const match = trimmed.match(/^"([^"]+)"\s*"([^"]*)"$/);
    if (match) {
      const [, key, value] = match;
      stack[stack.length - 1][key] = value;
      continue;
    }
    const keyMatch = trimmed.match(/^"([^"]+)"$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
    }
  }
  return result;
}
function getSteamLibraryPaths(steamPath) {
  const vdfPath = path.join(steamPath, "steamapps", "libraryfolders.vdf");
  if (!fs.existsSync(vdfPath)) {
    return [steamPath];
  }
  try {
    const content = fs.readFileSync(vdfPath, "utf-8");
    const parsed = parseVdf(content);
    const libraryFolders = parsed["libraryfolders"];
    if (!libraryFolders) {
      return [steamPath];
    }
    const paths = [];
    for (const key of Object.keys(libraryFolders)) {
      if (/^\d+$/.test(key)) {
        const entry = libraryFolders[key];
        if (entry && typeof entry.path === "string") {
          paths.push(entry.path);
        }
      }
    }
    return paths.length > 0 ? paths : [steamPath];
  } catch (error) {
    console.error("Failed to parse libraryfolders.vdf:", error);
    return [steamPath];
  }
}
function parseAppManifest(manifestPath) {
  try {
    const content = fs.readFileSync(manifestPath, "utf-8");
    const parsed = parseVdf(content);
    const appState = parsed["AppState"];
    if (!appState) return null;
    const appId = appState["appid"];
    const name = appState["name"];
    const installDir = appState["installdir"];
    if (!appId || !name || !installDir) return null;
    const libraryPath = path.dirname(path.dirname(manifestPath));
    const fullPath = path.join(libraryPath, "steamapps", "common", installDir);
    return {
      appId,
      name,
      installDir,
      fullPath
    };
  } catch (error) {
    console.error(`Failed to parse manifest ${manifestPath}:`, error);
    return null;
  }
}
function scanSteamLibrary(libraryPath) {
  const steamappsPath = path.join(libraryPath, "steamapps");
  if (!fs.existsSync(steamappsPath)) {
    return [];
  }
  const apps = [];
  try {
    const files = fs.readdirSync(steamappsPath);
    for (const file of files) {
      if (file.startsWith("appmanifest_") && file.endsWith(".acf")) {
        const manifestPath = path.join(steamappsPath, file);
        const app = parseAppManifest(manifestPath);
        if (app && fs.existsSync(app.fullPath)) {
          apps.push(app);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to scan library ${libraryPath}:`, error);
  }
  return apps;
}
function scanAllSteamLibraries() {
  const steamPath = findSteamPath();
  if (!steamPath) {
    console.warn("Steam installation not found");
    return [];
  }
  const libraryPaths = getSteamLibraryPaths(steamPath);
  const libraries = [];
  for (const path2 of libraryPaths) {
    const apps = scanSteamLibrary(path2);
    libraries.push({ path: path2, apps });
  }
  return libraries;
}
function getAllSteamGames() {
  const libraries = scanAllSteamLibraries();
  return libraries.flatMap((lib) => lib.apps);
}
function normalizeSearchTerm(term) {
  const variations = [term];
  const knownAbbrevs = ["LEGO", "LOTR", "GTA", "COD", "NFS", "NBA", "NFL", "WWE", "DMC", "MGS", "AOE", "CIV"];
  if (term === term.toUpperCase() && term.length > 4) {
    let allCapsSplit = term;
    for (const abbr of knownAbbrevs) {
      if (term.includes(abbr) && term !== abbr) {
        allCapsSplit = allCapsSplit.replace(new RegExp(`(${abbr})`, "g"), " $1 ").trim().replace(/\s+/g, " ");
      }
    }
    if (allCapsSplit !== term) {
      variations.push(allCapsSplit);
    }
  }
  const split = term.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  if (split !== term) {
    variations.push(split);
  }
  const abbreviations = {
    "LOTR": "Lord of the Rings",
    "LEGO": "LEGO",
    "GTA": "Grand Theft Auto",
    "COD": "Call of Duty",
    "NFS": "Need for Speed",
    "FIFA": "FIFA",
    "NBA": "NBA",
    "NFL": "NFL",
    "WWE": "WWE",
    "RE": "Resident Evil",
    "DMC": "Devil May Cry",
    "MGS": "Metal Gear Solid",
    "FF": "Final Fantasy",
    "KH": "Kingdom Hearts",
    "AC": "Assassins Creed",
    "FC": "Far Cry",
    "BF": "Battlefield",
    "TW": "Total War",
    "AOE": "Age of Empires",
    "CIV": "Civilization",
    "WOW": "World of Warcraft",
    "DOTA": "Dota",
    "LOL": "League of Legends",
    "CS": "Counter Strike",
    "TF": "Team Fortress",
    "HL": "Half Life",
    "L4D": "Left 4 Dead"
  };
  const basesForExpansion = Array.from(/* @__PURE__ */ new Set([term, ...variations.slice(1)]));
  for (const base of basesForExpansion) {
    let expanded = base;
    for (const [abbr, full] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, "gi");
      if (regex.test(expanded)) {
        expanded = expanded.replace(new RegExp(`\\b${abbr}\\b`, "gi"), full);
      }
    }
    if (expanded !== base && !variations.includes(expanded)) {
      variations.push(expanded);
    }
  }
  const cleaned = term.replace(/^(The|A)\s+/i, "").replace(/\s*(Game|Edition|Remastered|Remake|HD|Definitive|GOTY)$/i, "");
  if (cleaned !== term && cleaned.length > 2) {
    variations.push(cleaned);
  }
  return Array.from(new Set(variations));
}
async function searchSteamStore(term) {
  if (!term || term.length < 2) return null;
  const variations = normalizeSearchTerm(term);
  for (const searchTerm of variations) {
    try {
      const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(searchTerm)}&l=english&cc=US`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "DXVK-Studio"
        }
      });
      if (!response.ok) continue;
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        console.log(`Steam search: "${term}" → "${searchTerm}" found: ${data.items[0].name}`);
        return data.items[0].id;
      }
    } catch (error) {
      console.warn(`Failed to search Steam Store for "${searchTerm}":`, error);
    }
  }
  return null;
}
async function searchSteamStoreMultiple(term) {
  if (!term || term.length < 2) return [];
  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DXVK-Studio"
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!data.items) return [];
    return data.items.slice(0, 10).map((item) => ({
      id: item.id,
      name: item.name,
      // Use Steam header image (460x215) for better quality
      imageUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${item.id}/header.jpg`
    }));
  } catch (error) {
    console.warn(`Failed to search Steam Store for "${term}":`, error);
    return [];
  }
}
const execAsync = util.promisify(child_process.exec);
const GOG_REGISTRY_KEY = "HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games";
async function findGogGames() {
  var _a;
  const games = [];
  try {
    const { stdout } = await execAsync(`reg query "${GOG_REGISTRY_KEY}"`);
    const lines = stdout.split("\n").filter((line) => line.trim().length > 0);
    const gameKeys = lines.filter((line) => line.includes("GOG.com\\Games\\"));
    for (const key of gameKeys) {
      try {
        const gameId = (_a = key.split("\\").pop()) == null ? void 0 : _a.trim();
        if (!gameId) continue;
        const { stdout: details } = await execAsync(`reg query "${key.trim()}" /s`);
        const pathMatch = details.match(/\s+path\s+REG_SZ\s+(.+)/i);
        const exeMatch = details.match(/\s+exe\s+REG_SZ\s+(.+)/i);
        const nameMatch = details.match(/\s+gameName\s+REG_SZ\s+(.+)/i) || details.match(/\s+displayName\s+REG_SZ\s+(.+)/i);
        if (pathMatch && exeMatch) {
          const installDir = pathMatch[1].trim();
          const exePath = path.join(installDir, exeMatch[1].trim());
          const name = nameMatch ? nameMatch[1].trim() : `GOG Game ${gameId}`;
          if (fs.existsSync(exePath)) {
            games.push({
              id: `gog-${crypto.randomUUID()}`,
              name,
              path: installDir,
              // Legacy support
              executable: exePath,
              // Legacy support
              platform: "gog",
              dxvkStatus: "inactive",
              createdAt: (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
              architecture: "unknown"
              // Will be analyzed later
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to parse GOG game key ${key}:`, err);
      }
    }
  } catch (error) {
    if (error.code !== 1) {
      console.error("Error scanning GOG registry:", error);
    }
  }
  return games;
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    node_crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
const native = { randomUUID: node_crypto.randomUUID };
function _v4(options, buf, offset) {
  var _a;
  options = options || {};
  const rnds = options.random ?? ((_a = options.rng) == null ? void 0 : _a.call(options)) ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  return _v4(options);
}
function findEpicGames() {
  const games = [];
  const programData = process.env.ProgramData || "C:\\ProgramData";
  const manifestsPath = path.join(programData, "Epic", "EpicGamesLauncher", "Data", "Manifests");
  if (!fs.existsSync(manifestsPath)) {
    return [];
  }
  try {
    const files = fs.readdirSync(manifestsPath);
    for (const file of files) {
      if (file.endsWith(".item")) {
        try {
          const content = fs.readFileSync(path.join(manifestsPath, file), "utf-8");
          const manifest = JSON.parse(content);
          const { DisplayName, InstallLocation, LaunchExecutable } = manifest;
          if (DisplayName && InstallLocation && LaunchExecutable) {
            const installDir = InstallLocation;
            const exePath = path.join(installDir, LaunchExecutable);
            if (fs.existsSync(exePath)) {
              games.push({
                id: `epic-${v4()}`,
                name: DisplayName,
                path: installDir,
                executable: exePath,
                platform: "epic",
                dxvkStatus: "inactive",
                createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
                architecture: "unknown"
                // Will be analyzed
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to parse Epic manifest ${file}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("Failed to scan Epic manifests:", error);
  }
  return games;
}
const PE_MACHINE_I386 = 332;
const PE_MACHINE_AMD64 = 34404;
const ANTI_CHEAT_SIGNATURES = [
  {
    name: "EasyAntiCheat",
    files: ["EasyAntiCheat.exe", "EasyAntiCheat_x64.dll", "EasyAntiCheat_x86.dll"],
    riskLevel: "high",
    description: "Kernel-level anti-cheat. DXVK may trigger a ban."
  },
  {
    name: "BattlEye",
    files: ["BEService.exe", "BEClient_x64.dll", "BEClient.dll"],
    riskLevel: "high",
    description: "Kernel-level anti-cheat. DXVK may trigger a ban."
  },
  {
    name: "Vanguard",
    files: ["vgc.exe", "vgk.sys"],
    riskLevel: "high",
    description: "Riot Vanguard. Do not use DXVK with Valorant."
  },
  {
    name: "PunkBuster",
    files: ["pbsvc.exe", "PnkBstrA.exe", "PnkBstrB.exe"],
    riskLevel: "medium",
    description: "Legacy anti-cheat. May or may not detect DXVK."
  }
];
function readBytesAt(fd, offset, length) {
  const buffer = Buffer.alloc(length);
  fs.readSync(fd, buffer, 0, length, offset);
  return buffer;
}
function analyzeExecutable(exePath) {
  let fd = null;
  try {
    fd = fs.openSync(exePath, "r");
    const dosHeader = readBytesAt(fd, 0, 2);
    if (dosHeader.toString("ascii") !== "MZ") {
      return {
        architecture: "unknown",
        machineType: 0,
        isValid: false,
        error: "Not a valid PE file (missing MZ signature)"
      };
    }
    const lfanewBuffer = readBytesAt(fd, 60, 4);
    const peOffset = lfanewBuffer.readUInt32LE(0);
    if (peOffset < 64 || peOffset > 1024) {
      return {
        architecture: "unknown",
        machineType: 0,
        isValid: false,
        error: "Invalid PE header offset"
      };
    }
    const peSignature = readBytesAt(fd, peOffset, 4);
    if (peSignature.toString("ascii") !== "PE\0\0") {
      return {
        architecture: "unknown",
        machineType: 0,
        isValid: false,
        error: "Invalid PE signature"
      };
    }
    const machineBuffer = readBytesAt(fd, peOffset + 4, 2);
    const machineType = machineBuffer.readUInt16LE(0);
    let architecture = "unknown";
    if (machineType === PE_MACHINE_I386) {
      architecture = "32";
    } else if (machineType === PE_MACHINE_AMD64) {
      architecture = "64";
    }
    return {
      architecture,
      machineType,
      isValid: true
    };
  } catch (error) {
    return {
      architecture: "unknown",
      machineType: 0,
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error reading file"
    };
  } finally {
    if (fd !== null) {
      fs.closeSync(fd);
    }
  }
}
function findGameExecutables(gamePath) {
  const { readdirSync, statSync } = require("fs");
  const { join, extname } = require("path");
  const executables = [];
  try {
    const entries = readdirSync(gamePath);
    for (const entry of entries) {
      const fullPath = join(gamePath, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && extname(entry).toLowerCase() === ".exe") {
          const lowerName = entry.toLowerCase();
          if (!lowerName.includes("unins") && !lowerName.includes("redist") && !lowerName.includes("vcredist") && !lowerName.includes("dxsetup") && !lowerName.includes("directx") && !lowerName.includes("crash") && !lowerName.includes("report") && !lowerName.includes("launcher") || lowerName === "launcher.exe") {
            executables.push(entry);
          }
        }
      } catch {
      }
    }
  } catch (error) {
    console.error(`Failed to scan directory ${gamePath}:`, error);
  }
  return executables;
}
const GITHUB_REPOS = {
  official: "doitsujin/dxvk",
  gplasync: "Sporif/dxvk-async",
  // Archived but still accessible
  nvapi: "jp7677/dxvk-nvapi"
};
function getEnginesPath() {
  var _a, _b;
  const userDataPath = ((_b = (_a = electron.app) == null ? void 0 : _a.getPath) == null ? void 0 : _b.call(_a, "userData")) ?? path.join(process.env.APPDATA || "", "dxvk-studio");
  const enginesPath = path.join(userDataPath, "engines");
  if (!fs.existsSync(enginesPath)) {
    fs.mkdirSync(enginesPath, { recursive: true });
  }
  return enginesPath;
}
function getVersionPath(fork, version) {
  return path.join(getEnginesPath(), fork, version);
}
function isVersionCached(fork, version) {
  const versionPath = getVersionPath(fork, version);
  return fs.existsSync(path.join(versionPath, "x64", "dxgi.dll")) || fs.existsSync(path.join(versionPath, "x32", "d3d9.dll"));
}
function getCachedVersions(fork) {
  const forkPath = path.join(getEnginesPath(), fork);
  if (!fs.existsSync(forkPath)) {
    return [];
  }
  try {
    return fs.readdirSync(forkPath, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
  } catch {
    return [];
  }
}
function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        const { statSync } = require("fs");
        size += statSync(fullPath).size;
      } else if (entry.isDirectory()) {
        size += getDirectorySize(fullPath);
      }
    }
  } catch {
  }
  return size;
}
function getAllCachedEngines() {
  const engines = [];
  const forks = ["official", "gplasync", "nvapi"];
  for (const fork of forks) {
    const versions = getCachedVersions(fork);
    for (const version of versions) {
      const versionPath = getVersionPath(fork, version);
      const sizeBytes = getDirectorySize(versionPath);
      engines.push({
        fork,
        version,
        path: versionPath,
        sizeBytes
      });
    }
  }
  return engines;
}
async function fetchReleases(fork, limit = 10) {
  if (fork === "gplasync") {
    return fetchGitLabReleases(limit);
  }
  return fetchGitHubReleases(fork, limit);
}
async function fetchGitHubReleases(fork, limit) {
  const repo = GITHUB_REPOS[fork];
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${limit}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DXVK-Studio"
      }
    });
    if (response.status === 403) {
      console.warn("GitHub API rate limited - using fallback versions");
      return getFallbackReleases(fork);
    }
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch releases for ${fork}:`, error);
    return getFallbackReleases(fork);
  }
}
async function fetchGitLabReleases(limit) {
  const url = `https://gitlab.com/api/v4/projects/Ph42oN%2Fdxvk-gplasync/releases?per_page=${limit}`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DXVK-Studio"
      }
    });
    if (!response.ok) {
      throw new Error(`GitLab API returned ${response.status}`);
    }
    const gitlabReleases = await response.json();
    return gitlabReleases.map((release) => {
      const tarGzLink = release.assets.links.find((l) => l.name.endsWith(".tar.gz"));
      return {
        tag_name: release.tag_name,
        name: release.name,
        published_at: release.released_at,
        body: release.description,
        assets: tarGzLink ? [{
          name: tarGzLink.name,
          browser_download_url: tarGzLink.direct_asset_url
        }] : []
      };
    });
  } catch (error) {
    console.error("Failed to fetch releases from GitLab:", error);
    return getFallbackReleases("gplasync");
  }
}
function getFallbackReleases(fork) {
  if (fork === "gplasync") {
    const gplVersions = ["2.7.1-1", "2.7-1", "2.6.2-1", "2.6.1-1", "2.6-1", "2.5.3-1"];
    return gplVersions.map((version) => ({
      tag_name: `v${version}`,
      name: `DXVK GPL Async ${version}`,
      published_at: (/* @__PURE__ */ new Date()).toISOString(),
      body: "Fallback version (API unavailable)",
      assets: [{
        name: `dxvk-gplasync-v${version}.tar.gz`,
        browser_download_url: `https://gitlab.com/Ph42oN/dxvk-gplasync/-/raw/main/releases/dxvk-gplasync-v${version}.tar.gz?ref_type=heads`
      }]
    }));
  }
  const fallbackData = {
    official: {
      versions: ["2.7.1", "2.7", "2.6.1", "2.5.3", "2.5.1", "2.5", "2.4.1"],
      assetPrefix: "dxvk"
    },
    nvapi: {
      versions: ["0.7.1", "0.7.0", "0.6.9", "0.6.8", "0.6.7"],
      assetPrefix: "dxvk-nvapi"
    }
  };
  const repo = GITHUB_REPOS[fork];
  const data = fallbackData[fork];
  return data.versions.map((version) => {
    const assetVersion = fork === "nvapi" ? `v${version}` : version;
    const filename = `${data.assetPrefix}-${assetVersion}.tar.gz`;
    return {
      tag_name: `v${version}`,
      name: `DXVK ${version}`,
      published_at: (/* @__PURE__ */ new Date()).toISOString(),
      body: "Fallback version (API rate limited)",
      assets: [{
        name: filename,
        browser_download_url: `https://github.com/${repo}/releases/download/v${version}/${filename}`
      }]
    };
  });
}
function releaseToEngine(release, fork) {
  const asset = release.assets.find(
    (a) => a.name.endsWith(".zip") || a.name.endsWith(".tar.gz") || a.name.endsWith(".tar.xz")
  );
  if (!asset) {
    console.warn(`No downloadable asset found for release ${release.tag_name}`);
    return null;
  }
  const version = release.tag_name.replace(/^v/, "");
  return {
    id: `${fork}-${version}`,
    version,
    fork,
    releaseDate: release.published_at,
    downloadUrl: asset.browser_download_url,
    localPath: getVersionPath(fork, version),
    cached: isVersionCached(fork, version),
    changelog: release.body
  };
}
async function getAvailableEngines(fork) {
  const releases = await fetchReleases(fork);
  const engines = releases.map((r) => releaseToEngine(r, fork)).filter((e) => e !== null);
  for (const engine of engines) {
    engine.cached = isVersionCached(fork, engine.version);
    if (engine.cached) {
      engine.localPath = getVersionPath(fork, engine.version);
    }
  }
  return engines;
}
async function downloadEngine(fork, version, downloadUrl, onProgress) {
  var _a;
  const versionPath = getVersionPath(fork, version);
  const tempPath = path.join(getEnginesPath(), `temp-${fork}-${version}.tar.gz`);
  fs.mkdirSync(versionPath, { recursive: true });
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    const contentLength = parseInt(response.headers.get("content-length") || "0");
    let downloadedBytes = 0;
    const fileStream = fs.createWriteStream(tempPath);
    const reader = (_a = response.body) == null ? void 0 : _a.getReader();
    if (!reader) {
      throw new Error("No response body");
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(value);
      downloadedBytes += value.length;
      if (onProgress && contentLength > 0) {
        onProgress(Math.round(downloadedBytes / contentLength * 100));
      }
    }
    await new Promise((resolve, reject) => {
      fileStream.end((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await tar.extract({
      file: tempPath,
      cwd: versionPath,
      strip: 1
      // Remove the top-level directory from the archive
    });
    fs.rmSync(tempPath, { force: true });
    return versionPath;
  } catch (error) {
    fs.rmSync(tempPath, { force: true });
    fs.rmSync(versionPath, { recursive: true, force: true });
    throw error;
  }
}
function deleteEngine(fork, version) {
  const versionPath = getVersionPath(fork, version);
  if (fs.existsSync(versionPath)) {
    fs.rmSync(versionPath, { recursive: true, force: true });
  }
}
function getEngineDlls(fork, version, architecture) {
  const versionPath = getVersionPath(fork, version);
  const archFolder = architecture === "32" ? "x32" : "x64";
  const dllPath = path.join(versionPath, archFolder);
  if (!fs.existsSync(dllPath)) {
    return [];
  }
  try {
    return fs.readdirSync(dllPath).filter((f) => f.endsWith(".dll")).map((f) => path.join(dllPath, f));
  } catch {
    return [];
  }
}
function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}
function getManifestPath(gamePath) {
  return path.join(gamePath, "dxvk_studio_manifest.json");
}
function readManifest(gamePath) {
  const manifestPath = getManifestPath(gamePath);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}
function writeManifest(gamePath, manifest) {
  const manifestPath = getManifestPath(gamePath);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
function isDxvkInstalled(gamePath) {
  return readManifest(gamePath) !== null;
}
function getInstalledVersion(gamePath) {
  const manifest = readManifest(gamePath);
  if (!manifest) {
    return null;
  }
  return {
    version: manifest.engineVersion,
    fork: manifest.engineFork
  };
}
function checkIntegrity(gamePath) {
  const manifest = readManifest(gamePath);
  if (!manifest) {
    return "not_installed";
  }
  for (const dll of manifest.dlls) {
    const dllPath = path.join(gamePath, dll.name);
    if (!fs.existsSync(dllPath)) {
      return "missing";
    }
    const currentHash = hashFile(dllPath);
    if (currentHash !== dll.hash) {
      return "corrupt";
    }
  }
  return "ok";
}
function installDxvk(gamePath, gameId, fork, version, architecture) {
  if (architecture === "unknown") {
    throw new Error("Cannot install DXVK: unknown architecture");
  }
  const sourceDlls = getEngineDlls(fork, version, architecture);
  if (sourceDlls.length === 0) {
    throw new Error(`No DLLs found for ${fork} ${version} (${architecture}-bit)`);
  }
  const deployedDlls = [];
  for (const sourceDll of sourceDlls) {
    const dllName = path.basename(sourceDll);
    const targetPath = path.join(gamePath, dllName);
    const backupPath = path.join(gamePath, `${dllName}.bak_dxvk_studio`);
    if (fs.existsSync(targetPath)) {
      const manifest2 = readManifest(gamePath);
      const isOurDll = manifest2 == null ? void 0 : manifest2.dlls.some((d) => d.name === dllName);
      if (!isOurDll) {
        fs.renameSync(targetPath, backupPath);
      }
    }
    fs.copyFileSync(sourceDll, targetPath);
    deployedDlls.push({
      name: dllName,
      hash: hashFile(targetPath),
      backupPath: fs.existsSync(backupPath) ? backupPath : void 0
    });
  }
  const manifest = {
    gameId,
    engineVersion: version,
    engineFork: fork,
    architecture,
    installedAt: (/* @__PURE__ */ new Date()).toISOString(),
    dlls: deployedDlls
  };
  writeManifest(gamePath, manifest);
  return manifest;
}
function uninstallDxvk(gamePath) {
  const manifest = readManifest(gamePath);
  if (!manifest) {
    return false;
  }
  for (const dll of manifest.dlls) {
    const dllPath = path.join(gamePath, dll.name);
    const backupPath = dll.backupPath;
    if (fs.existsSync(dllPath)) {
      fs.rmSync(dllPath);
    }
    if (backupPath && fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, dllPath);
    }
  }
  const confPath = path.join(gamePath, "dxvk.conf");
  if (fs.existsSync(confPath) && manifest.configPath === confPath) {
    fs.rmSync(confPath);
  }
  fs.rmSync(getManifestPath(gamePath));
  return true;
}
function generateConfigFile(config) {
  const lines = [
    "# DXVK Configuration",
    "# Generated by DXVK Studio",
    ""
  ];
  if (config.enableAsync !== void 0) {
    lines.push(`dxvk.enableAsync = ${config.enableAsync}`);
  }
  if (config.numCompilerThreads !== void 0) {
    lines.push(`dxvk.numCompilerThreads = ${config.numCompilerThreads}`);
  }
  if (config.maxFrameLatency !== void 0) {
    lines.push(`dxgi.maxFrameLatency = ${config.maxFrameLatency}`);
  }
  if (config.syncInterval !== void 0) {
    lines.push(`dxgi.syncInterval = ${config.syncInterval}`);
  }
  if (config.maxFrameRate !== void 0) {
    lines.push(`dxgi.maxFrameRate = ${config.maxFrameRate}`);
  }
  if (config.maxDeviceMemory !== void 0) {
    lines.push(`dxgi.maxDeviceMemory = ${config.maxDeviceMemory}`);
  }
  if (config.customVendorId) {
    lines.push(`dxgi.customVendorId = ${config.customVendorId}`);
  }
  if (config.customDeviceId) {
    lines.push(`dxgi.customDeviceId = ${config.customDeviceId}`);
  }
  if (config.enableHDR !== void 0) {
    lines.push(`dxgi.enableHDR = ${config.enableHDR}`);
  }
  if (config.hud && config.hud.length > 0) {
    lines.push(`DXVK_HUD = ${config.hud.join(",")}`);
  }
  if (config.logLevel) {
    lines.push(`DXVK_LOG_LEVEL = ${config.logLevel}`);
  }
  return lines.join("\n");
}
function writeConfig(gamePath, config) {
  const confPath = path.join(gamePath, "dxvk.conf");
  const content = generateConfigFile(config);
  fs.writeFileSync(confPath, content);
  const manifest = readManifest(gamePath);
  if (manifest) {
    manifest.configPath = confPath;
    writeManifest(gamePath, manifest);
  }
}
function findFilesRecursive(dir, targetFiles, maxDepth = 3, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  const foundFiles = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        const lowerName = entry.name.toLowerCase();
        if (targetFiles.some((target) => lowerName === target.toLowerCase())) {
          foundFiles.push(fullPath);
        }
      } else if (entry.isDirectory()) {
        const skipDirs = ["node_modules", ".git", "__pycache__", "logs", "saves"];
        if (!skipDirs.includes(entry.name.toLowerCase())) {
          foundFiles.push(...findFilesRecursive(fullPath, targetFiles, maxDepth, currentDepth + 1));
        }
      }
    }
  } catch {
  }
  return foundFiles;
}
function detectAntiCheat(gamePath) {
  if (!fs.existsSync(gamePath)) {
    return [];
  }
  const detected = [];
  for (const signature of ANTI_CHEAT_SIGNATURES) {
    const foundFiles = findFilesRecursive(gamePath, signature.files);
    if (foundFiles.length > 0) {
      detected.push({
        ...signature,
        foundFiles
      });
    }
  }
  return detected;
}
function getAntiCheatSummary(gamePath) {
  const detected = detectAntiCheat(gamePath);
  return {
    hasAntiCheat: detected.length > 0,
    highRisk: detected.some((ac) => ac.riskLevel === "high"),
    detected: detected.map((ac) => ac.name)
  };
}
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let mainWindow = null;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    backgroundColor: "#0a0a0b",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow == null ? void 0 : mainWindow.show();
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(process.env.DIST, "index.html"));
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    mainWindow = null;
  }
});
electron.ipcMain.handle("dialog:openFile", async () => {
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    title: "Select Game Executable",
    filters: [{ name: "Executables", extensions: ["exe"] }],
    properties: ["openFile"]
  });
  return result.canceled ? null : result.filePaths[0];
});
electron.ipcMain.handle("dialog:openFolder", async () => {
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    title: "Select Game Folder",
    properties: ["openDirectory"]
  });
  return result.canceled ? null : result.filePaths[0];
});
electron.ipcMain.handle("fs:exists", async (_, path2) => {
  return fs.existsSync(path2);
});
electron.ipcMain.handle("shell:openPath", async (_, path2) => {
  return electron.shell.openPath(path2);
});
electron.ipcMain.handle("games:scanAll", async () => {
  try {
    const steamApps = getAllSteamGames();
    const gogGames = await findGogGames();
    const epicGames = findEpicGames();
    const analyze = (gamePath, mainExe) => {
      const exePath = mainExe ? path.join(gamePath, mainExe) : "";
      let architecture = "unknown";
      if (exePath && fs.existsSync(exePath)) {
        const analysis = analyzeExecutable(exePath);
        architecture = analysis.architecture;
      }
      let dxvkStatus = "inactive";
      let dxvkVersion;
      let dxvkFork;
      if (isDxvkInstalled(gamePath)) {
        const installed = getInstalledVersion(gamePath);
        const integrity = checkIntegrity(gamePath);
        if (installed) {
          dxvkVersion = installed.version;
          dxvkFork = installed.fork;
        }
        dxvkStatus = integrity === "ok" ? "active" : integrity;
      }
      return { architecture, dxvkStatus, dxvkVersion, dxvkFork };
    };
    const processedSteam = await Promise.all(
      steamApps.map(async (app2) => {
        const executables = findGameExecutables(app2.fullPath);
        const mainExe = executables[0] || "";
        const analysis = analyze(app2.fullPath, mainExe);
        return {
          id: `steam-${app2.appId}`,
          name: app2.name,
          path: app2.fullPath,
          executable: mainExe,
          architecture: analysis.architecture,
          platform: "steam",
          steamAppId: app2.appId,
          dxvkStatus: analysis.dxvkStatus,
          dxvkVersion: analysis.dxvkVersion,
          dxvkFork: analysis.dxvkFork,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      })
    );
    const processedGog = await Promise.all(
      gogGames.map(async (game) => {
        const mainExe = game.executable ? path.basename(game.executable) : "";
        const analysis = analyze(game.path, mainExe);
        return {
          ...game,
          // Already has id, name, path
          executable: mainExe,
          architecture: analysis.architecture,
          dxvkStatus: analysis.dxvkStatus,
          dxvkVersion: analysis.dxvkVersion,
          dxvkFork: analysis.dxvkFork
        };
      })
    );
    const processedEpic = await Promise.all(
      epicGames.map(async (game) => {
        const mainExe = game.executable ? path.basename(game.executable) : "";
        const analysis = analyze(game.path, mainExe);
        return {
          ...game,
          executable: mainExe,
          architecture: analysis.architecture,
          dxvkStatus: analysis.dxvkStatus,
          dxvkVersion: analysis.dxvkVersion,
          dxvkFork: analysis.dxvkFork
        };
      })
    );
    return [...processedSteam, ...processedGog, ...processedEpic];
  } catch (error) {
    console.error("Failed to scan games:", error);
    return [];
  }
});
electron.ipcMain.handle("games:searchMetadata", async (_, term) => {
  return searchSteamStore(term);
});
electron.ipcMain.handle("games:searchMetadataMultiple", async (_, term) => {
  return searchSteamStoreMultiple(term);
});
electron.ipcMain.handle("games:checkSteam", async () => {
  return findSteamPath() !== null;
});
electron.ipcMain.handle("pe:analyze", async (_, exePath) => {
  return analyzeExecutable(exePath);
});
electron.ipcMain.handle("pe:findExecutables", async (_, gamePath) => {
  return findGameExecutables(gamePath);
});
electron.ipcMain.handle("engines:getAvailable", async (_, fork) => {
  return getAvailableEngines(fork);
});
electron.ipcMain.handle("engines:getCached", async (_, fork) => {
  return getCachedVersions(fork);
});
electron.ipcMain.handle("engines:isCached", async (_, fork, version) => {
  return isVersionCached(fork, version);
});
electron.ipcMain.handle("engines:download", async (_, fork, version, url) => {
  try {
    const path2 = await downloadEngine(fork, version, url, (percent) => {
      mainWindow == null ? void 0 : mainWindow.webContents.send("engines:downloadProgress", { fork, version, percent });
    });
    return { success: true, path: path2 };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("engines:getAllCached", async () => {
  return getAllCachedEngines();
});
electron.ipcMain.handle("engines:delete", async (_, fork, version) => {
  try {
    deleteEngine(fork, version);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("dxvk:install", async (_, gamePath, gameId, fork, version, architecture) => {
  try {
    const manifest = installDxvk(gamePath, gameId, fork, version, architecture);
    return { success: true, manifest };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("dxvk:uninstall", async (_, gamePath) => {
  try {
    const result = uninstallDxvk(gamePath);
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("dxvk:checkStatus", async (_, gamePath) => {
  const installed = isDxvkInstalled(gamePath);
  if (!installed) {
    return { installed: false };
  }
  const version = getInstalledVersion(gamePath);
  const integrity = checkIntegrity(gamePath);
  return {
    installed: true,
    version: version == null ? void 0 : version.version,
    fork: version == null ? void 0 : version.fork,
    integrity
  };
});
electron.ipcMain.handle("config:save", async (_, gamePath, config) => {
  try {
    writeConfig(gamePath, config);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("anticheat:detect", async (_, gamePath) => {
  return detectAntiCheat(gamePath);
});
electron.ipcMain.handle("anticheat:summary", async (_, gamePath) => {
  return getAntiCheatSummary(gamePath);
});
