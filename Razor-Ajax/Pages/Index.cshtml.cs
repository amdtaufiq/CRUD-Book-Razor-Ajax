using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Newtonsoft.Json;
using Razor_Ajax.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Razor_Ajax.Pages
{
    public class IndexModel : PageModel
    {
        HttpClientHandler _client = new HttpClientHandler();
        public const string APIBOOK = "https://localhost:44375/api/books";

        public IndexModel()
        {
            _client.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) =>
            {
                return true;
            };
        }

        [BindProperty]
        public Book Book { get; set; }

        public IEnumerable<Book> Books { get; set; }

        private readonly static List<Book> BookCek = new List<Book>();

        public async Task<PartialViewResult> OnGetViewAllPartial()
        {
            using(var httpClient = new HttpClient(_client))
            {
                using(var response = await httpClient.GetAsync(APIBOOK))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    Books = JsonConvert.DeserializeObject<IEnumerable<Book>>(apiResponse);
                    return new PartialViewResult
                    {
                        ViewName = "_ViewAll",
                        ViewData = new ViewDataDictionary<IEnumerable<Book>>(ViewData, Books)
                    };
                }
            }
        }

        public async Task<IActionResult> OnDeleteDeleteBook(int bookId)
        {
            if(bookId < 0)
            {
                return new JsonResult($"Book ID is null");
            }
            using(var httpClient = new HttpClient(_client))
            {
                using(var response = await httpClient.DeleteAsync(APIBOOK + "/" + bookId))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    Book = JsonConvert.DeserializeObject<Book>(apiResponse);
                }
            }
            
            return new JsonResult($"{Book.Name}: Deleted Successfully");
        }

        public PartialViewResult OnGetCreateBookPartial()
        {
            return new PartialViewResult
            {
                ViewName = "_CreateBook",
                ViewData = new ViewDataDictionary<Book>(ViewData, new Book { })
            };
        }

        public PartialViewResult OnGetGetBookPartial(Book book)
        {
            return new PartialViewResult
            {
                ViewName = "_CreateBook",
                ViewData = new ViewDataDictionary<Book>(ViewData, book)
            };
        }

        public PartialViewResult OnPostCreateBookPartial(Book book)
        {
            if (ModelState.IsValid)
            {
                BookCek.Add(book);
            }

            return new PartialViewResult
            {
                ViewName = "_CreateBook",
                ViewData = new ViewDataDictionary<Book>(ViewData, book)
            };
        }

        public async Task<IActionResult> OnPostAddBook([FromBody] Book book)
        {
            using (var httpClient = new HttpClient(_client))
            {
                StringContent content = new StringContent(JsonConvert.SerializeObject(book), Encoding.UTF8, "application/json");

                using (var response = await httpClient.PostAsync(APIBOOK, content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    Book = JsonConvert.DeserializeObject<Book>(apiResponse);
                }
                return new JsonResult($"{Book.Name}: Added Successfully");
            }
        }

        public async Task<IActionResult> OnPutUpdateBook([FromBody] Book book, int bookId)
        {
            if(bookId < 0)
            {
                return new JsonResult($"Book ID is null");
            }
            book.Id = bookId;
            using (var httpClient = new HttpClient(_client))
            {
                StringContent content = new StringContent(JsonConvert.SerializeObject(book), Encoding.UTF8, "application/json");
                using (var response = await httpClient.PutAsync(APIBOOK+"/"+bookId, content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    Book = JsonConvert.DeserializeObject<Book>(apiResponse);
                }
            }

            return new JsonResult($"{Book.Name}: Update Successfully");
        }
    }
}
