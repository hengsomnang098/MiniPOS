using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Auth
{
    public class LoginUserDto
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }
    }
}