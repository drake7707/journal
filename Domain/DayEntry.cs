using Dapper;
using Journal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Domain
{
    public class DayEntry
    {
        [Key]
        public int Id { get; set; }

        // TODO use FTS5 extensions to make it indexable and usuable for searching

        public string Day { get; set; }

        public string Tags { get; set; }

        public MoodEnum Mood { get; set; }

        public int Version { get; set; }
    }
}
