import { env } from "../../config/env";

const BUFFER_API = "https://api.buffer.com";

function toAsset(url: string): Record<string, { url: string }> {
  const ext = url.split("?").shift()?.split(".").pop()?.toLowerCase() || "";
  const key = ["mp4", "mov", "avi", "webm", "mkv", "m4v"].includes(ext) ? "video" : "image";
  return { [key]: { url } };
}

async function graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(BUFFER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.bufferApiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as { errors?: { message: string }[]; data: T };
  if (json.errors) throw new Error(json.errors[0]?.message || "Buffer API error");
  return json.data;
}

export namespace BufferService {
  export async function getOrganizations() {
    const query = `
      query GetOrganizations {
        account {
          organizations {
            id
            name
          }
        }
      }
    `;
    const data = await graphql<{ account: { organizations: { id: string; name: string }[] } }>(query);
    return data.account.organizations;
  }

  export async function getChannels(organizationId: string) {
    const query = `
      query GetChannels($orgId: OrganizationId!) {
        channels(input: { organizationId: $orgId }) {
          id
          name
          avatar
          service
          type
          isDisconnected
          isLocked
          descriptor
          timezone
        }
      }
    `;
    const data = await graphql<{ channels: any[] }>(query, { orgId: organizationId });
    return data.channels;
  }

  export async function getPosts(organizationId: string, first: number = 20, after?: string) {
    const query = `
      query GetPosts($orgId: OrganizationId!, $first: Int, $after: String) {
        posts(input: { organizationId: $orgId }, first: $first, after: $after) {
          edges {
            node {
              id
              text
              status
              dueAt
              sentAt
              createdAt
              channelId
              channelService
              channel {
                name
                avatar
                service
              }
              assets {
                id
                type
                mimeType
                source
                thumbnail
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    const data = await graphql<{ posts: any }>(query, { orgId: organizationId, first, after });
    return data.posts;
  }

  export async function createPost(input: {
    channelId: string;
    text: string;
    scheduledAt?: string;
    mediaUrls?: string[];
  }) {
    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess {
            post {
              id
              text
              status
              dueAt
              channelId
            }
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    const variables: any = {
      input: {
        channelId: input.channelId,
        text: input.text,
        schedulingType: "automatic",
        mode: input.scheduledAt ? "customScheduled" : "addToQueue",
        ...(input.scheduledAt ? { dueAt: new Date(input.scheduledAt).toISOString() } : {}),
        ...(input.mediaUrls?.length ? { assets: input.mediaUrls.map(toAsset) } : {}),
      },
    };

    const data = await graphql<{ createPost: any }>(mutation, variables);
    return data.createPost;
  }

  export async function broadcast(input: {
    organizationId: string;
    text: string;
    scheduledAt?: string;
    mediaUrls?: string[];
  }) {
    const channels = await getChannels(input.organizationId);
    const activeChannels = channels.filter((c: any) => !c.isDisconnected && !c.isLocked);

    if (activeChannels.length === 0) {
      throw new Error("No active channels to broadcast to");
    }

    const results: { channelId: string; channelName: string; success: boolean; error?: string }[] = [];

    for (const ch of activeChannels) {
      try {
        await createPost({
          channelId: ch.id,
          text: input.text,
          scheduledAt: input.scheduledAt,
          mediaUrls: input.mediaUrls,
        });
        results.push({ channelId: ch.id, channelName: ch.name, success: true });
      } catch (err: any) {
        results.push({ channelId: ch.id, channelName: ch.name, success: false, error: err.message });
      }
    }

    return results;
  }
}
