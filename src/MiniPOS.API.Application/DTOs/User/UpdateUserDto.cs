namespace MiniPOS.API.Application.DTOs.User
{
    public class UpdateUserDto : CreateUserDto
    {
        public Guid Id { get; set; }
    }
}