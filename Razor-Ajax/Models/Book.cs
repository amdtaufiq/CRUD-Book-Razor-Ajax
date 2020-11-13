using System.ComponentModel.DataAnnotations;

namespace Razor_Ajax.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string ISBN { get; set; }

        [Required]
        public string Author { get; set; }
    }
}
