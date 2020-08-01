using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Models
{
    public class DayData
    {
        public string Content { get; set; }
        public MoodEnum Mood { get; set; }

        public string Date { get; set; }

        public string[] Tags { get; set; }


        public int Version { get; set; }
    }
}
