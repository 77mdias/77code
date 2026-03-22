/* eslint-disable @typescript-eslint/no-explicit-any */
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = '77mdias';

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  accent: string;
  accentBg: string;
  href: string;
  github: string;
  image?: string;
}

const ACCENT_COLORS = [
  { accent: "var(--blue)", accentBg: "var(--blue-bg)" },
  { accent: "var(--lavender)", accentBg: "var(--lavender-bg)" },
  { accent: "var(--sage)", accentBg: "var(--sage-bg)" },
  { accent: "var(--amber)", accentBg: "var(--amber-bg)" },
  { accent: "var(--rose)", accentBg: "var(--rose-bg)" },
  { accent: "var(--teal)", accentBg: "var(--teal-bg)" }
];

export async function getGithubProjects(): Promise<Project[]> {
  // Se houver um token, tentamos buscar os repositórios Pinned via GraphQL (Recomendado)
  if (GITHUB_TOKEN) {
    try {
      const resp = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          query: `
            {
              user(login: "${USERNAME}") {
                repositories(first: 6, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false, privacy: PUBLIC) {
                  nodes {
                    id
                    name
                    description
                    url
                    homepageUrl
                    openGraphImageUrl
                    usesCustomOpenGraphImage
                    primaryLanguage {
                      name
                    }
                    repositoryTopics(first: 3) {
                      nodes {
                        topic {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
        next: { revalidate: 60 }, // Cache por 1 hora (ISR)
      });

      if (resp.ok) {
        const { data, errors } = await resp.json();
        if (errors) {
            console.error("GraphQL Errors:", errors);
        }
        const nodes = data?.user?.repositories?.nodes || [];
        
        if (nodes.length > 0) {
          return nodes.map((repo: any, index: number) => {
            const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
            const stack = repo.repositoryTopics?.nodes?.map((n: any) => n.topic.name) || [];
            if (repo.primaryLanguage && !stack.includes(repo.primaryLanguage.name.toLowerCase())) {
               stack.unshift(repo.primaryLanguage.name);
            }

            return {
              id: String(index + 1).padStart(2, '0'),
              title: repo.name,
              description: repo.description || 'No description provided.',
              stack: stack.slice(0, 4), // Mostrar no maximo 4 tech tags
              accent: color.accent,
              accentBg: color.accentBg,
              href: repo.homepageUrl || repo.url,
              github: repo.url,
              image: repo.usesCustomOpenGraphImage ? repo.openGraphImageUrl : undefined,
            };
          });
        }
      } else {
        console.error("GraphQL fetch failed with status", resp.status, await resp.text());
      }
    } catch (e) {
      console.error("Erro ao buscar repositorios fixados do GitHub GraphQL", e);
    }
  }

  // Fallback: Buscar ultimos atualizados via REST API Publica (sem token)
  try {
    const resp = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=6`, {
      next: { revalidate: 60 }
    });
    
    if (resp.ok) {
        const repos = await resp.json();
        return repos.map((repo: any, index: number) => {
            const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
            return {
                id: String(index + 1).padStart(2, '0'),
                title: repo.name,
                description: repo.description || 'No description provided.',
                stack: repo.language ? [repo.language] : [],
                accent: color.accent,
                accentBg: color.accentBg,
                href: repo.homepage || repo.html_url,
                github: repo.html_url,
                image: `https://opengraph.githubassets.com/1/${USERNAME}/${repo.name}`,
            };
        });
    }
  } catch (e) {
    console.error("Erro ao buscar repositorios do GitHub REST API", e);
  }

  return [];
}

export interface EngineeringRepo {
  name: string;
  description: string;
  lang: string;
  langColor: string;
  type: string;
  status: string;
  github: string;
  live: string | null;
}

export async function getGithubEngineeringRepos(): Promise<EngineeringRepo[]> {
  if (GITHUB_TOKEN) {
    try {
      const resp = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          query: `{
            user(login: "${USERNAME}") {
              repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false, privacy: PUBLIC) {
                nodes {
                  name
                  description
                  url
                  homepageUrl
                  isArchived
                  primaryLanguage {
                    name
                    color
                  }
                  repositoryTopics(first: 1) {
                    nodes {
                      topic {
                        name
                      }
                    }
                  }
                }
              }
            }
          }`,
        }),
        next: { revalidate: 3600 },
      });

      if (resp.ok) {
        const { data } = await resp.json();
        const nodes = data?.user?.repositories?.nodes || [];
        
        if (nodes.length > 0) {
          return nodes.map((repo: any) => {
            return {
              name: repo.name,
              description: repo.description?.slice(0, 100) + (repo.description?.length > 100 ? '...' : '') || 'No description provided.',
              lang: repo.primaryLanguage?.name || 'Unknown',
              langColor: repo.primaryLanguage?.color || '#3178c6',
              type: repo.repositoryTopics?.nodes?.[0]?.topic?.name || 'Repository',
              status: repo.isArchived ? 'archived' : 'active',
              github: repo.url,
              live: repo.homepageUrl || null,
            };
          });
        }
      }
    } catch (e) {
      console.error("Erro ao buscar repositorios recentes do GitHub GraphQL", e);
    }
  }

  try {
    const resp = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=12`, {
      next: { revalidate: 60 }
    });
    
    if (resp.ok) {
        const repos = await resp.json();
        return repos.filter((r: any) => !r.fork).slice(0, 10).map((repo: any) => {
            return {
                name: repo.name,
                description: repo.description?.slice(0, 100) + (repo.description?.length > 100 ? '...' : '') || 'No description provided.',
                lang: repo.language || 'Unknown',
                langColor: '#3178c6',
                type: 'Repository',
                status: repo.archived ? 'archived' : 'active',
                github: repo.html_url,
                live: repo.homepage || null,
            };
        });
    }
  } catch (e) {
    console.error("Erro ao buscar repositorios recentes do GitHub REST API", e);
  }

  return [];
}
