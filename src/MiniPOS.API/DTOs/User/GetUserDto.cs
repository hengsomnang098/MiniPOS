namespace MiniPOS.DTOs.User
{
    public class GetUserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public Guid RoleId { get; set; }
        public string Role { get; set; }
    }
}