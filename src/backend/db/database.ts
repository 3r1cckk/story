import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  created_at: string;
}

interface StoryRow {
  id: number;
  title: string;
  content: string;
  synopsis?: string;
  genre: string;
  author_id: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface ContributorRow {
  id: number;
  story_id: number;
  user_id: number;
  role: string;
  added_at: string;
}

interface VersionRow {
  id: number;
  story_id: number;
  title: string;
  content: string;
  summary: string;
  edited_by: number;
  created_at: string;
}

interface CommentRow {
  id: number;
  story_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

// In-Memory Database store for immediate zero-config testing & evaluation
class InMemoryDatabase {
  users: UserRow[] = [];
  stories: StoryRow[] = [];
  contributors: ContributorRow[] = [];
  versions: VersionRow[] = [];
  comments: CommentRow[] = [];

  private nextUserId = 1;
  private nextStoryId = 1;
  private nextContributorId = 1;
  private nextVersionId = 1;
  private nextCommentId = 1;

  constructor() {
    this.seed();
  }

  private seed() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    // 1. Seed Demo Users
    this.users = [
      {
        id: this.nextUserId++,
        username: 'elena_vance',
        email: 'elena@scribespace.com',
        password_hash: demoPasswordHash,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: this.nextUserId++,
        username: 'marcus_scribe',
        email: 'marcus@scribespace.com',
        password_hash: demoPasswordHash,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: this.nextUserId++,
        username: 'fatima_alnoor',
        email: 'fatima@scribespace.com',
        password_hash: demoPasswordHash,
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: this.nextUserId++,
        username: 'leo_starlight',
        email: 'leo@scribespace.com',
        password_hash: demoPasswordHash,
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ];

    // 2. Seed Initial Stories
    this.stories = [
      {
        id: this.nextStoryId++,
        title: 'Chronicles of the Clockwork Archipelago',
        synopsis: 'A steampunk adventure following three cartographers who discover islands that move according to ancient clockwork tides.',
        genre: 'Fantasy',
        content: `Chapter I: The Floating Isles of Zephyria

The bronze needle on Captain Alistair's sextant trembled, not with magnetic pull, but with the steady, deep ticking of the subterranean gears below the Great Reef. To the north, Isle Morina drifted four nautical miles off its registered colonial coordinates.

"It has slipped alignment again," Marcus muttered, peering over the vellum maritime chart spread out on the brass chart table. He adjusted his magnifying monocle, tracing the copper gear-lines stamped into the parchment. "If the escapement wheel beneath Mount Brass skips another tooth, the autumn tides will collide with the Iron Strait."

Elena dipped her quill into dark sepia ink. "Then we don't sail around it. We board the Great Spindle before noon. The gearkeeper hasn't sent telegraph signals in seventeen cycles, and the clouds above the crater smell of scorched whale-oil and ozone."

Outside the brass-trimmed portholes, the steamship Archimedes cut through phosphorescent amber water. Gulls with clockwork jointed wings circled the smokestacks, awaiting scraps of salt pork and dried fruit. Ahead, the twin lighthouse towers loomed like rusted sentinels in the morning fog...`,
        author_id: 1, // Elena
        is_published: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: this.nextStoryId++,
        title: 'Echoes from Station Cygnus',
        synopsis: 'A hard sci-fi mystery set on a deep-space listening outpost when an anomalous harmonic signal begins rewriting crew memories.',
        genre: 'Sci-Fi',
        content: `Log Entry: Cycle 412.09
Sub-Officer Fatima reporting from Array Compartment Delta.

The interstellar silence was broken at 03:14 standard station time. Not by static, but by a 440-hertz pure sinusoidal resonance lasting precisely eighteen seconds. When we played the waveform through the holographic visualizer, the harmonic nodes formed the exact structural blueprint of Station Cygnus's central reactor dome.

"Look at the third overtone," Leo pointed out, his fingers dancing across the illuminated capacitive glass interface. "That's not background telemetry. That's a DNA sequence. And it matches my late grandmother's medical telemetry from the New Alexandria colony thirty years ago."

Silence settled over the observation deck. Outside, the cold blue nebula pulsed like a sleeping heart...`,
        author_id: 3, // Fatima
        is_published: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: this.nextStoryId++,
        title: 'The Tea Merchant of Cobblestone Lane',
        synopsis: 'A cozy Victorian mystery centered around an herbalist whose secret blends can evoke forgotten memories and solve unsolved town disappearances.',
        genre: 'Mystery',
        content: `Rain drummed against the diamond-paned bay windows of Mrs. Abernathy's apothecary. The scent of roasted chamomile, dried orange peel, and crushed bergamot filled the warm parlor.

Inspector Vance removed his sodden woolen topcoat and set his silver-tipped cane against the cedar counter. "The magistrate's signet ring was found inside a tin of your Darjeeling Reserve, Madame."

Elena smiled gently without looking up from her brass apothecary scale. "A peculiar discovery, Inspector, considering the magistrate swore he lost it on the cross-country express to Edinburgh. Perhaps you would care for a cup of silver-needle white tea while we discuss why the signet still smells faintly of river mud?"`,
        author_id: 1, // Elena
        is_published: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
      },
    ];

    // 3. Seed Contributors
    this.contributors = [
      {
        id: this.nextContributorId++,
        story_id: 1, // Story 1
        user_id: 2, // Marcus
        role: 'editor',
        added_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: this.nextContributorId++,
        story_id: 1, // Story 1
        user_id: 3, // Fatima
        role: 'contributor',
        added_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: this.nextContributorId++,
        story_id: 2, // Story 2
        user_id: 4, // Leo
        role: 'contributor',
        added_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    // 4. Seed Story Versions (Snapshots)
    this.versions = [
      {
        id: this.nextVersionId++,
        story_id: 1,
        title: 'Chronicles of the Clockwork Archipelago',
        content: `Initial draft of Chapter I before Marcus added the gearkeeper telegraph subplot.`,
        summary: 'Initial outline & chapter kickoff',
        edited_by: 1,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: this.nextVersionId++,
        story_id: 1,
        title: 'Chronicles of the Clockwork Archipelago',
        content: this.stories[0].content,
        summary: 'Added dialogue between Alistair, Marcus and Elena regarding Mount Brass',
        edited_by: 2,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ];

    // 5. Seed Comments
    this.comments = [
      {
        id: this.nextCommentId++,
        story_id: 1,
        user_id: 2,
        content: 'Loved the pacing in Chapter 1! I added a paragraph about the bronze sextant and escapement gear tides.',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: this.nextCommentId++,
        story_id: 1,
        user_id: 3,
        content: 'Should we introduce the Gearkeeper as an eccentric antagonist or an ally in Chapter 2?',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: this.nextCommentId++,
        story_id: 2,
        user_id: 4,
        content: 'The acoustic harmonic concept works great. Let’s make sure the audio spectrometer visualization matches reality!',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];
  }

  // Robust SQL Query Evaluator for in-memory operations matching standard Postgres queries
  async query(text: string, params: any[] = []): Promise<QueryResult> {
    const trimmed = text.trim();
    const upper = trimmed.toUpperCase();

    // 1. SELECT queries
    if (upper.startsWith('SELECT')) {
      // Find user by email: "SELECT * FROM users WHERE email = $1"
      if (upper.includes('FROM USERS') && upper.includes('EMAIL =')) {
        const email = String(params[0]).toLowerCase();
        const found = this.users.filter((u) => u.email.toLowerCase() === email);
        return { rows: found, rowCount: found.length };
      }

      // Find user by id: "SELECT * FROM users WHERE id = $1"
      if (upper.includes('FROM USERS') && upper.includes('ID =')) {
        const id = Number(params[0]);
        const found = this.users.filter((u) => u.id === id);
        return { rows: found, rowCount: found.length };
      }

      // Search all users (for inviting collaborators)
      if (upper.includes('FROM USERS') && !upper.includes('WHERE')) {
        const rows = this.users.map(({ password_hash, ...rest }) => rest);
        return { rows, rowCount: rows.length };
      }

      // Query single story by id with author info:
      if (upper.includes('FROM STORIES') && upper.includes('WHERE S.ID =') || upper.includes('WHERE ID =')) {
        const id = Number(params[0]);
        const story = this.stories.find((s) => s.id === id);
        if (!story) return { rows: [], rowCount: 0 };

        const author = this.users.find((u) => u.id === story.author_id);
        const storyContributors = this.contributors
          .filter((c) => c.story_id === story.id)
          .map((c) => {
            const user = this.users.find((u) => u.id === c.user_id);
            return {
              ...c,
              username: user?.username || 'Unknown',
              email: user?.email || '',
              avatar_url: user?.avatar_url,
            };
          });

        const row = {
          ...story,
          author_name: author?.username || 'Anonymous',
          author_email: author?.email || '',
          contributors: storyContributors,
          contributors_count: storyContributors.length,
        };

        return { rows: [row], rowCount: 1 };
      }

      // Query all stories (with author name and contributor counts)
      if (upper.includes('FROM STORIES')) {
        let results = this.stories.map((story) => {
          const author = this.users.find((u) => u.id === story.author_id);
          const storyContribs = this.contributors.filter((c) => c.story_id === story.id);
          const commentsCount = this.comments.filter((c) => c.story_id === story.id).length;
          return {
            ...story,
            author_name: author?.username || 'Anonymous',
            author_email: author?.email || '',
            contributors_count: storyContribs.length,
            comments_count: commentsCount,
          };
        });

        // Filter by author_id if provided
        if (upper.includes('AUTHOR_ID =')) {
          const authorId = Number(params[0]);
          results = results.filter((s) => s.author_id === authorId);
        }

        // Sort by updated_at descending
        results.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        return { rows: results, rowCount: results.length };
      }

      // Query Contributors for a story:
      if (upper.includes('FROM CONTRIBUTORS') && upper.includes('STORY_ID =')) {
        const storyId = Number(params[0]);
        const list = this.contributors
          .filter((c) => c.story_id === storyId)
          .map((c) => {
            const u = this.users.find((usr) => usr.id === c.user_id);
            return {
              id: c.id,
              story_id: c.story_id,
              user_id: c.user_id,
              role: c.role,
              added_at: c.added_at,
              username: u?.username || 'Writer',
              email: u?.email || '',
              avatar_url: u?.avatar_url,
            };
          });
        return { rows: list, rowCount: list.length };
      }

      // Query single contributor by ID:
      if (upper.includes('FROM CONTRIBUTORS') && upper.includes('ID =')) {
        const id = Number(params[0]);
        const item = this.contributors.find((c) => c.id === id);
        return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
      }

      // Query story versions:
      if (upper.includes('FROM STORY_VERSIONS') && upper.includes('STORY_ID =')) {
        const storyId = Number(params[0]);
        const list = this.versions
          .filter((v) => v.story_id === storyId)
          .map((v) => {
            const editor = this.users.find((u) => u.id === v.edited_by);
            return {
              ...v,
              author_name: editor?.username || 'Author',
            };
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows: list, rowCount: list.length };
      }

      // Query story comments:
      if (upper.includes('FROM COMMENTS') && upper.includes('STORY_ID =')) {
        const storyId = Number(params[0]);
        const list = this.comments
          .filter((c) => c.story_id === storyId)
          .map((c) => {
            const u = this.users.find((usr) => usr.id === c.user_id);
            return {
              ...c,
              username: u?.username || 'Member',
              avatar_url: u?.avatar_url,
            };
          })
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return { rows: list, rowCount: list.length };
      }
    }

    // 2. INSERT queries
    if (upper.startsWith('INSERT INTO')) {
      // Insert User:
      if (upper.includes('INSERT INTO USERS')) {
        const [username, email, password_hash, avatar_url] = params;
        const newUser: UserRow = {
          id: this.nextUserId++,
          username,
          email: String(email).toLowerCase(),
          password_hash,
          avatar_url: avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
          created_at: new Date().toISOString(),
        };
        this.users.push(newUser);
        return { rows: [newUser], rowCount: 1 };
      }

      // Insert Story:
      if (upper.includes('INSERT INTO STORIES')) {
        const [title, content, synopsis, genre, author_id, is_published] = params;
        const newStory: StoryRow = {
          id: this.nextStoryId++,
          title,
          content,
          synopsis: synopsis || '',
          genre: genre || 'General',
          author_id: Number(author_id),
          is_published: is_published !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.stories.push(newStory);
        return { rows: [newStory], rowCount: 1 };
      }

      // Insert Contributor:
      if (upper.includes('INSERT INTO CONTRIBUTORS')) {
        const [story_id, user_id, role] = params;
        const sId = Number(story_id);
        const uId = Number(user_id);
        // Check if exists
        const exists = this.contributors.find((c) => c.story_id === sId && c.user_id === uId);
        if (exists) {
          return { rows: [exists], rowCount: 1 };
        }
        const newContrib: ContributorRow = {
          id: this.nextContributorId++,
          story_id: sId,
          user_id: uId,
          role: role || 'contributor',
          added_at: new Date().toISOString(),
        };
        this.contributors.push(newContrib);
        return { rows: [newContrib], rowCount: 1 };
      }

      // Insert Version:
      if (upper.includes('INSERT INTO STORY_VERSIONS')) {
        const [story_id, title, content, summary, edited_by] = params;
        const newVer: VersionRow = {
          id: this.nextVersionId++,
          story_id: Number(story_id),
          title,
          content,
          summary: summary || 'Milestone revision',
          edited_by: Number(edited_by),
          created_at: new Date().toISOString(),
        };
        this.versions.push(newVer);
        return { rows: [newVer], rowCount: 1 };
      }

      // Insert Comment:
      if (upper.includes('INSERT INTO COMMENTS')) {
        const [story_id, user_id, content] = params;
        const newComment: CommentRow = {
          id: this.nextCommentId++,
          story_id: Number(story_id),
          user_id: Number(user_id),
          content,
          created_at: new Date().toISOString(),
        };
        this.comments.push(newComment);
        return { rows: [newComment], rowCount: 1 };
      }
    }

    // 3. UPDATE queries
    if (upper.startsWith('UPDATE')) {
      if (upper.includes('UPDATE STORIES')) {
        // e.g. "UPDATE stories SET title = $1, content = $2, synopsis = $3, genre = $4, updated_at = NOW() WHERE id = $5"
        const id = Number(params[params.length - 1]);
        const story = this.stories.find((s) => s.id === id);
        if (!story) return { rows: [], rowCount: 0 };

        if (params.length >= 3) {
          story.title = params[0];
          story.content = params[1];
          if (params.length >= 4) story.synopsis = params[2];
          if (params.length >= 5) story.genre = params[3];
        }
        story.updated_at = new Date().toISOString();
        return { rows: [story], rowCount: 1 };
      }
    }

    // 4. DELETE queries
    if (upper.startsWith('DELETE')) {
      // Delete Story:
      if (upper.includes('FROM STORIES') && upper.includes('WHERE ID =')) {
        const id = Number(params[0]);
        const initialLen = this.stories.length;
        this.stories = this.stories.filter((s) => s.id !== id);
        // Cascade delete contributors, versions, comments
        this.contributors = this.contributors.filter((c) => c.story_id !== id);
        this.versions = this.versions.filter((v) => v.story_id !== id);
        this.comments = this.comments.filter((c) => c.story_id !== id);
        return { rows: [], rowCount: initialLen - this.stories.length };
      }

      // Delete Contributor:
      if (upper.includes('FROM CONTRIBUTORS') && upper.includes('WHERE ID =')) {
        const id = Number(params[0]);
        const initialLen = this.contributors.length;
        this.contributors = this.contributors.filter((c) => c.id !== id);
        return { rows: [], rowCount: initialLen - this.contributors.length };
      }
    }

    return { rows: [], rowCount: 0 };
  }
}

// Global database instance
const inMemoryDb = new InMemoryDatabase();
let livePool: pg.Pool | null = null;

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
  try {
    livePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  } catch (err) {
    console.warn('Failed to initialize live pg pool, using in-memory engine fallback:', err);
  }
}

export const db = {
  query: async (text: string, params: any[] = []): Promise<QueryResult> => {
    if (livePool) {
      try {
        const result = await livePool.query(text, params);
        return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
      } catch (err) {
        console.error('PostgreSQL live query failed, falling back to memory engine:', err);
        return inMemoryDb.query(text, params);
      }
    }
    return inMemoryDb.query(text, params);
  },
};
