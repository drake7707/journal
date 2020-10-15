using Dapper;

namespace Journal.Domain
{

    public class DBVersion
    {
        [Key]
        public int Id { get; set; }
        public int Version { get; set; }
    }

}
