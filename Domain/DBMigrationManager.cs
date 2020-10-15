using Dapper;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Journal.Domain
{
    public class DBMigrationManager
    {
        private readonly DALManager dalManager;
        private readonly string databasePath;
        private readonly SqliteConnection dbManager;

        public DBMigrationManager(DALManager dalManager, string databasePath, SqliteConnection dbManager)
        {
            this.dalManager = dalManager;
            this.databasePath = databasePath;
            this.dbManager = dbManager;
        }

        private const int LAST_VERSION = 2;
        public void DoMigration()
        {

            int currentVersion = dalManager.GetCurrentDBVersion();

            if (currentVersion == 1) // migrate to v2
            {
                dbManager.CreateTable<DBVersion>();
                dbManager.Insert(new DBVersion() { Id = 1, Version = 2 });

                dbManager.AddColumn<DayEntry>(d => d.ImageCount);
                dbManager.AddColumn<DayEntry>(d => d.WordCount);

                var entries = dalManager.GetEntries();
                foreach (var entry in entries)
                {
                    try
                    {
                        var contents = dalManager.GetEntryContents(entry);
                        var cleanContents = dbManager.Query<string>("SELECT contents FROM entryContents WHERE Id=@id", new { id = entry.Id }).FirstOrDefault();

                        int imageCount = Regex.Matches(contents, @"<\s*img(.*?)\s*(?:>|/>)").Count;

                        int wordCount = !string.IsNullOrEmpty(cleanContents) ? Regex.Matches(cleanContents,@"\b(\w+)\b").Count : 0;

                        entry.ImageCount = imageCount;
                        entry.WordCount = wordCount;

                        dbManager.Update(entry);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"Unable to update image count & word count of entry {entry.Day}: {ex.GetType().FullName} {ex.Message}");
                    }
                    
                }

                currentVersion = 2;
                dbManager.Update(new DBVersion() { Id = 1, Version = currentVersion });
            }

            if (currentVersion == 2)
            {
                // ....
            }


        }
        public void CheckAndMigrate()
        {
            int currentVersion = dalManager.GetCurrentDBVersion();

            if (currentVersion < LAST_VERSION)
            {
                // make a backup copy, migrate and then delete backup
                System.IO.File.Copy(databasePath, databasePath + ".bak");
                try
                {

                    DoMigration();
                    System.IO.File.Delete(databasePath + ".bak");
                }
                catch (Exception ex)
                {
                    dbManager.Close();
                    // put the original pre-migration file back
                    if (System.IO.File.Exists(databasePath + ".bak"))
                    {
                        System.IO.File.Delete(databasePath);
                        System.IO.File.Move(databasePath + ".bak", databasePath);
                    }

                    throw;
                }
            }


        }
    }
}
