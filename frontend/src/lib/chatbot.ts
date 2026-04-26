export type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
};

// Attack definitions based on dataset labels
const ATTACK_INFO: Record<string, { explanation: string; mitigation: string; keywords: string[] }> = {
  "bot": {
    keywords: ["bot", "botnet", "zombie"],
    explanation: "A Botnet attack involves a network of compromised computers (bots) controlled by a malicious actor to perform distributed attacks, steal data, or send spam.",
    mitigation: "To prevent Botnet infections, use strong endpoint protection, keep systems patched, monitor unusual outbound traffic, and implement strict firewall rules."
  },
  "ddos": {
    keywords: ["ddos", "distributed denial of service"],
    explanation: "DDoS (Distributed Denial of Service) is an attack where multiple compromised systems target a single server or network to overwhelm it with traffic, rendering it unavailable to legitimate users.",
    mitigation: "Mitigate DDoS attacks using traffic filtering, rate limiting, Cloudflare/AWS Shield, and scaling resources to absorb excess traffic."
  },
  "dos_goldeneye": {
    keywords: ["goldeneye", "dos goldeneye"],
    explanation: "GoldenEye is an HTTP Keep-Alive resource exhaustion DoS attack. It tries to keep many connections open to the server and consumes all available sockets.",
    mitigation: "Implement connection limits per IP, use reverse proxies (like Nginx) to handle connection pooling, and monitor active connection counts."
  },
  "dos_hulk": {
    keywords: ["hulk", "dos hulk", "http unbearable load king"],
    explanation: "HULK (HTTP Unbearable Load King) is a DoS tool that generates dynamic, unique requests to bypass caching layers and exhaust web server resources.",
    mitigation: "Use Web Application Firewalls (WAF) to detect anomalous request patterns, enforce reCAPTCHA on suspicious traffic, and set strict request-rate limits."
  },
  "dos_slowhttptest": {
    keywords: ["slowhttptest", "slow http", "slow-http"],
    explanation: "SlowHTTPTest is an attack that holds HTTP connections open by sending partial HTTP requests at a very slow rate, exhausting the server's connection pool.",
    mitigation: "Configure strict timeout limits on HTTP requests (e.g., Apache's RequestReadTimeout or Nginx's client_body_timeout) and limit concurrent connections."
  },
  "dos_slowloris": {
    keywords: ["slowloris", "slow loris"],
    explanation: "Slowloris is a highly targeted DoS attack that takes down web servers by sending partial HTTP requests and keeping connections open as long as possible.",
    mitigation: "Deploy load balancers or reverse proxies that only forward completely received HTTP requests to the backend server."
  },
  "ftp_patator": {
    keywords: ["ftp patator", "ftp-patator", "ftp brute force", "ftp bruteforce"],
    explanation: "FTP-Patator represents an FTP brute-force attack where an attacker systematically tries many passwords using the Patator tool to gain unauthorized FTP access.",
    mitigation: "Enforce strong password policies, limit login attempts (account lockout), and ideally replace FTP with secure alternatives like SFTP."
  },
  "ssh_patator": {
    keywords: ["ssh patator", "ssh-patator", "ssh brute force", "ssh bruteforce"],
    explanation: "SSH-Patator is a brute-force attack targeting SSH services to guess credentials and gain remote access to your servers.",
    mitigation: "Disable password authentication for SSH (use SSH keys instead), change the default SSH port, and install tools like fail2ban to block repeated failed logins."
  },
  "heartbleed": {
    keywords: ["heartbleed", "cve-2014-0160"],
    explanation: "Heartbleed is a critical vulnerability in old versions of OpenSSL that allows attackers to read the memory of the affected server, potentially exposing secret keys and passwords.",
    mitigation: "Ensure your OpenSSL library is updated to a non-vulnerable version, revoke old SSL certificates, and generate new key pairs."
  },
  "infiltration": {
    keywords: ["infiltration", "infiltrating", "inside threat", "backdoor"],
    explanation: "Infiltration attacks occur when malware or an attacker successfully breaches the internal network, often via social engineering, malicious attachments, or vulnerable software.",
    mitigation: "Train employees against phishing, segment internal networks, enforce the principle of least privilege, and use EDR (Endpoint Detection and Response) tools."
  },
  "portscan": {
    keywords: ["portscan", "port scan", "port-scan", "nmap"],
    explanation: "A Port Scan is a reconnaissance technique used by attackers to discover open ports and available services on a host, helping them identify potential vulnerabilities.",
    mitigation: "Block unwanted ports using a firewall, use Network Intrusion Detection Systems (NIDS) to detect scanning behavior, and restrict ICMP responses."
  },
  "web_bruteforce": {
    keywords: ["web brute force", "web bruteforce", "web attack - brute force", "login brute force"],
    explanation: "A Web Brute Force attack involves automated attempts to guess login credentials on a web application's authentication endpoints.",
    mitigation: "Implement robust rate limiting, CAPTCHAs on login forms, account lockout mechanisms, and Multi-Factor Authentication (MFA)."
  },
  "sql_injection": {
    keywords: ["sql injection", "sqli", "sql-injection", "web attack - sql injection"],
    explanation: "SQL Injection (SQLi) is an attack that manipulates a web application's database query by injecting malicious SQL code, allowing attackers to view or modify database contents.",
    mitigation: "Use prepared statements (parameterized queries) and Object-Relational Mapping (ORM) frameworks. Never concatenate user input directly into SQL commands."
  },
  "xss": {
    keywords: ["xss", "cross site scripting", "cross-site scripting", "web attack - xss"],
    explanation: "Cross-Site Scripting (XSS) is a vulnerability where attackers inject malicious client-side scripts into web pages viewed by other users, often leading to session hijacking.",
    mitigation: "Sanitize and escape all user input before rendering it in the browser, and implement Content Security Policy (CSP) headers."
  },
  "benign": {
    keywords: ["benign", "normal traffic", "not an attack"],
    explanation: "BENIGN refers to normal, legitimate network traffic that does not contain any malicious patterns or signatures.",
    mitigation: "No mitigation needed. Keep monitoring systems active to establish a baseline of what BENIGN traffic looks like."
  }
};

const PREDICTION_EXPLANATION: { keywords: string[]; response: string }[] = [
  {
    keywords: ["prediction", "predict", "classify", "classified", "result", "why", "how does the model"],
    response: "This system uses a trained Machine Learning model (typically a Random Forest or XGBoost mapping) to classify network traffic. When you upload a log file, the backend extracts flow features (like packet length, duration, flags) and passes them to the model, which outputs either 'BENIGN' or a specific attack class based on the patterns it learned during training."
  }
];

const GENERAL_QUERIES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["what is this", "project", "system do", "purpose", "how does this work", "about"],
    response: "This project is an Automated Security Threat Detection system. It allows you to upload network flow logs (CSV format) or manually input traffic parameters. The backend processes this data using AI/ML to detect whether the traffic is normal or malicious (e.g., DDoS, PortScan, SQLi)."
  },
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    response: "Hello! I am the Threat Detection Assistant. You can ask me about how the prediction works, information on specific cyber attacks (like DDoS, PortScan, SQL Injection), or how to prevent them."
  }
];

export function getBotResponse(userInput: string): string {
  const normalizedInput = userInput.toLowerCase();

  // 1. Check for Specific Attack Info & Prevention
  const isAskingPrevention = ["prevent", "mitigate", "stop", "fix", "protect", "defense"].some(word => normalizedInput.includes(word));
  
  for (const [key, data] of Object.entries(ATTACK_INFO)) {
    if (data.keywords.some(kw => normalizedInput.includes(kw))) {
      if (isAskingPrevention) {
        return `**How to prevent ${data.keywords[0].toUpperCase()}:**\n${data.mitigation}`;
      } else {
        return `**What is ${data.keywords[0].toUpperCase()}?**\n${data.explanation}`;
      }
    }
  }

  // 2. Check for general Prevention/Mitigation queries without a specific attack
  if (isAskingPrevention) {
    return "To provide prevention techniques, please specify the attack type (e.g., 'How to prevent DDoS' or 'How to stop SQL Injection').";
  }

  // 3. Check for Prediction Explanation
  for (const entry of PREDICTION_EXPLANATION) {
    if (entry.keywords.some(kw => normalizedInput.includes(kw))) {
      return entry.response;
    }
  }

  // 4. Check for General Queries
  for (const entry of GENERAL_QUERIES) {
    if (entry.keywords.some(kw => normalizedInput.includes(kw))) {
      return entry.response;
    }
  }

  // 5. Fallback Response
  return "Sorry, I can only answer questions related to cybersecurity attacks, mitigation strategies, and how this threat detection project works.";
}
