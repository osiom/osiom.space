/**
 * Data Storage Category Configuration
 * Includes: flow, solutions, and category information
 */

const DATA_STORAGE_CONFIG = {
  metadata: {
    id: 'data-storage',
    name: 'data-storage',
    title: 'Data Storage Solutions',
    description: `Data storage refers to the preservation of digital information using various technologies and methods. It can include personal files, documents, photos, videos, and backups.`,
    longDescription: `Choosing the right storage solution depends on your needs for privacy, control, accessibility, and cost. This decision tree helps you find alternatives that align with your values of data sovereignty and community support.`,
    topics: [
      {
        term: 'Proprietary vs Open Source',
        description: 'Closed commercial software vs transparent community-driven code'
      },
      {
        term: 'Centralised vs Decentralised',
        description: 'Single provider vs distributed network'
      },
      {
        term: 'P2P vs Blockchain',
        description: 'Direct peer sharing vs cryptographic distributed ledger'
      },
      {
        term: 'Cloud vs Self-hosted',
        description: 'Provider-managed vs your own infrastructure'
      }
    ]
  },

  flow: {
    questions: [
      {
        id: 'question-1',
        text: '// proprietary software or open source?',
        options: [
          {
            text: 'proprietary',
            value: 'proprietary',
            next: 'solutions',
            solutionKey: 'proprietary',
            tooltip: {
              title: 'Proprietary Software',
              description: 'Commercial software owned by companies. Typically closed-source with subscription fees, professional support, and regular updates.'
            }
          },
          {
            text: 'open source',
            value: 'opensource',
            next: 'question-2',
            tooltip: {
              title: 'Open Source Software',
              description: 'Software with publicly available source code. Free to use, modify, and distribute. Community-driven development with transparent practices.'
            }
          }
        ]
      },
      {
        id: 'question-2',
        text: '// centralised or decentralised?',
        options: [
          {
            text: 'centralised',
            value: 'centralised',
            next: 'question-3',
            tooltip: {
              title: 'Centralised Architecture',
              description: 'Data stored in one location or managed by a single provider. Simpler setup and easier management, but creates a single point of failure.'
            }
          },
          {
            text: 'decentralised',
            value: 'decentralised',
            next: 'question-4',
            tooltip: {
              title: 'Decentralised Architecture',
              description: 'Data distributed across multiple nodes. More resilient, censorship-resistant, and privacy-focused, but with added complexity.'
            }
          }
        ]
      },
      {
        id: 'question-3',
        text: '// self-hosted or in cloud?',
        options: [
          {
            text: 'self-hosted',
            value: 'selfhosted',
            next: 'solutions',
            solutionKey: 'opensource_centralised_selfhosted',
            tooltip: {
              title: 'Self-Hosted',
              description: 'Run on your own infrastructure. <strong>Complete control and privacy</strong>, but requires technical knowledge and ongoing maintenance.'
            }
          },
          {
            text: 'in cloud',
            value: 'cloud',
            next: 'solutions',
            solutionKey: 'opensource_centralised_cloud',
            tooltip: {
              title: 'Cloud Hosted',
              description: 'Hosted on external servers (VPS, cloud providers). Less maintenance required but you need to trust the provider.'
            }
          }
        ]
      },
      {
        id: 'question-4',
        text: '// p2p or blockchain?',
        options: [
          {
            text: 'p2p',
            value: 'p2p',
            next: 'solutions',
            solutionKey: 'opensource_decentralised_p2p',
            tooltip: {
              title: 'Peer-to-Peer (P2P)',
              description: 'Users share resources directly without central authority. <em>Direct sharing, cost-effective, but requires peers to be online.</em>'
            }
          },
          {
            text: 'blockchain',
            value: 'blockchain',
            next: 'solutions',
            solutionKey: 'opensource_decentralised_blockchain',
            tooltip: {
              title: 'Blockchain Technology',
              description: 'Distributed ledger with cryptographic verification. <em>Immutable records and incentivized storage, but higher costs and complexity.</em>'
            }
          }
        ]
      }
    ],

    pathResolver: (answers) => {
      // answers: [q1, q2, q3 or q4]
      const [type, architecture, method] = answers;

      if (type === 'proprietary') {
        return 'proprietary';
      }
      if (type === 'opensource' && architecture === 'centralised') {
        if (method === 'selfhosted') return 'opensource_centralised_selfhosted';
        if (method === 'cloud') return 'opensource_centralised_cloud';
      }
      if (type === 'opensource' && architecture === 'decentralised') {
        if (method === 'p2p') return 'opensource_decentralised_p2p';
        if (method === 'blockchain') return 'opensource_decentralised_blockchain';
      }
      return null;
    }
  },

  // Example solutions object (make sure your keys match the solutionKey above)
  solutions: {
    proprietary: {
      title: 'Proprietary Storage Solutions',
      items: [
        { 
          name: 'Dropbox', 
          description: 'Popular cloud storage with seamless sync across devices. Easy to use but requires subscription for larger storage.',
          url: 'https://dropbox.com' 
        },
        { 
          name: 'Google Drive', 
          description: 'Google\'s cloud storage integrated with Google Workspace. Free tier available with Google account.',
          url: 'https://drive.google.com' 
        },
        { 
          name: 'iCloud', 
          description: 'Apple\'s cloud storage service integrated with macOS and iOS. Best for Apple ecosystem users.',
          url: 'https://www.icloud.com' 
        }
      ]
    },
    opensource_centralised_selfhosted: {
      title: 'Open Source, Centralised, Self-Hosted',
      items: [
        { 
          name: 'Nextcloud', 
          description: 'Full-featured self-hosted cloud platform with file sync, calendar, contacts, and collaboration tools.',
          url: 'https://nextcloud.com' 
        },
        { 
          name: 'Seafile', 
          description: 'High-performance file sync and sharing platform with client-side encryption and version control.',
          url: 'https://www.seafile.com' 
        },
        { 
          name: 'Pydio Cells', 
          description: 'Modern file sharing platform with micro-services architecture and enterprise features.',
          url: 'https://pydio.com' 
        }
      ]
    },
    opensource_centralised_cloud: {
      title: 'Open Source, Centralised, Cloud',
      items: [
        { 
          name: 'Nextcloud (hosted)', 
          description: 'Nextcloud hosted by trusted providers. Get the benefits without managing your own server.',
          url: 'https://nextcloud.com/providers' 
        },
        { 
          name: 'Disroot', 
          description: 'Privacy-focused platform offering Nextcloud hosting along with other decentralized services.',
          url: 'https://disroot.org' 
        }
      ]
    },
    opensource_decentralised_p2p: {
      title: 'Open Source, Decentralised, P2P',
      items: [
        { 
          name: 'Syncthing', 
          description: 'Continuous file synchronization between your devices without relying on cloud servers.',
          url: 'https://syncthing.net' 
        },
        { 
          name: 'IPFS', 
          description: 'Distributed web protocol for storing and sharing data in a distributed file system.',
          url: 'https://ipfs.io' 
        },
        { 
          name: 'Resilio Sync', 
          description: 'Fast, reliable file sync powered by P2P technology. BitTorrent-based sync without cloud storage.',
          url: 'https://www.resilio.com/individuals' 
        }
      ]
    },
    opensource_decentralised_blockchain: {
      title: 'Open Source, Decentralised, Blockchain',
      items: [
        { 
          name: 'Arweave', 
          description: 'Permanent data storage with pay-once, store-forever model using blockchain technology.',
          url: 'https://www.arweave.org' 
        },
        { 
          name: 'Filecoin', 
          description: 'Decentralized storage network where users can rent out their storage space and earn tokens.',
          url: 'https://filecoin.io' 
        },
        { 
          name: 'Storj', 
          description: 'Decentralized cloud storage that encrypts, shreds and distributes your data across a network.',
          url: 'https://storj.io' 
        }
      ]
    }
  }
};

window.DATA_STORAGE_CONFIG = DATA_STORAGE_CONFIG;