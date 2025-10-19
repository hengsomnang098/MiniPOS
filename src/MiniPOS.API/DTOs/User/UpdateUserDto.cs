namespace MiniPOS.DTOs.User
{
    public class UpdateUserDto : CreateUserDto
    {
        public Guid Id { get; set; }
    }
}