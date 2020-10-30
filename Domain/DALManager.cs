using Dapper;
using Journal.Domain;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Domain
{
    public partial class DALManager
    {
        private readonly string entryStoragePath;
        private SqliteConnection dbManager;

        private string connectionString;

        private DBMigrationManager migrationManager;

        public DALManager(string databasePath, string entryStoragePath)
        {
            connectionString = "Data Source=" + databasePath;
            Dapper.SimpleCRUD.SetDialect(SimpleCRUD.Dialect.SQLite);

            if (!System.IO.Directory.Exists(System.IO.Path.GetDirectoryName(databasePath)))
                System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(databasePath));

            if (!System.IO.File.Exists(databasePath))
            {
                dbManager = new SqliteConnection(connectionString);
                dbManager.Open();
                dbManager.CreateTable<DayEntry>();
                dbManager.CreateIndex<DayEntry>(b => b.Day);
                dbManager.Execute("CREATE VIRTUAL TABLE entryContents USING FTS5(id, contents)");
            }
            else
            {
                dbManager = new SqliteConnection(connectionString);
                dbManager.Open();
            }

            this.entryStoragePath = entryStoragePath;
            if (!System.IO.Directory.Exists(entryStoragePath))
                System.IO.Directory.CreateDirectory(entryStoragePath);

            migrationManager = new DBMigrationManager(this, databasePath, dbManager);
            migrationManager.CheckAndMigrate();
        }

        public string[] GetAllEntryDates()
        {
            return dbManager.Query<string>($"SELECT {nameof(DayEntry.Day)} FROM {nameof(DayEntry)}").ToArray();
        }

        public List<DayEntry> GetEntries()
        {
            return dbManager.Query<DayEntry>($"SELECT * FROM {nameof(DayEntry)}").ToList();
        }

        public DayEntry GetEntry(string day)
        {
            return dbManager.QueryFirstOrDefault<DayEntry>($"SELECT * FROM {nameof(DayEntry)} WHERE {nameof(DayEntry.Day)}=@day", new { day = day });
        }

        public string GetEntryContents(DayEntry entry)
        {
            return System.IO.File.ReadAllText(GetPathForEntry(entry));
        }

        public async void SetEntry(DayEntry entry, string content, string textOnlyContent)
        {
            if (entry.Id == 0)
            {
                int id = (await dbManager.InsertAsync(entry)).Value;
                entry.Id = id;

                await dbManager.ExecuteAsync("INSERT INTO entryContents (id,contents) VALUES (@id, @contents)", new { id = entry.Id, contents = textOnlyContent });
            }
            else
            {
                int rowsAffected = await dbManager.UpdateAsync(entry);
                if (rowsAffected == 0)
                    throw new Exception("No records affected");

                await dbManager.ExecuteAsync("UPDATE entryContents SET contents = @contents WHERE id=@id", new { id = entry.Id, contents = textOnlyContent });
            }
            System.IO.File.WriteAllText(GetPathForEntry(entry), content);
        }

        private string GetPathForEntry(DayEntry entry)
        {
            return System.IO.Path.Combine(entryStoragePath, entry.Day + ".html");
        }

        public List<DayEntry> GetEntriesByTag(string tag)
        {
            return dbManager.Query<DayEntry>($@"
                    WITH split(id, tags, str) AS (
                        SELECT id, '', tags||',' FROM dayentry
                        UNION ALL SELECT id,
                        substr(str, 0, instr(str, ',')),
                        substr(str, instr(str, ',')+1)
                        FROM split WHERE str !=''
                    ) 
                    SELECT d.* FROM split s
                    join dayEntry d on d.Id = s.id
                      WHERE s.tags!='' and s.tags=@tag
                    ORDER BY d.Day DESC", new { tag = tag }).ToList();
        }

        public class SearchResult
        {
            public string Day { get; set; }
            public string Fragment { get; set; }

            public int WordCount { get; set; }
            public int ImageCount { get; set; }
        }
        public List<SearchResult> SearchEntries(string searchString, string prefix, string postfix)
        {
            return dbManager.Query<SearchResult>(@$"
                with x as (select id, snippet(entryContents, -1, @prefix, @postfix,'', 20) as fragment from entryContents where contents match @searchString order by rank)

                select {nameof(DayEntry.Day)}, x.fragment, d.wordCount, d.imageCount FROM x
                join {nameof(DayEntry)} d on x.id = d.id
                order by {nameof(DayEntry.Day)} desc", new { searchString = searchString, prefix = prefix, postfix = postfix })
                .ToList();
        }

        public class TagResult
        {
            public string Tag { get; set; }
            public int Freq { get; set; }
        }

        public List<TagResult> GetTags()
        {
            return dbManager.Query<TagResult>($@"
                    WITH split(id, tags, str) AS (
                        SELECT id, '', tags||',' FROM dayentry
                        UNION ALL SELECT id,
                        substr(str, 0, instr(str, ',')),
                        substr(str, instr(str, ',')+1)
                        FROM split WHERE str !=''
                    ) 

                    SELECT tags as tag, count(1) as freq FROM split WHERE tags!=''
                    group by tags
                    order by 2 desc").ToList();
        }


        public int GetCurrentDBVersion()
        {
            if (TableExists<DBVersion>())
            {
                return dbManager.Get<DBVersion>(1)?.Version ?? 1;
            }
            return 1;
        }


        private bool TableExists<T>()
        {
            return dbManager.QuerySingleOrDefault("SELECT name FROM sqlite_master WHERE type='table' AND name=@name", new { name = typeof(T).Name }) != null;
        }
    }
}
