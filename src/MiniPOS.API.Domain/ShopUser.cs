using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MiniPOS.API.Domain
{
    public class ShopUser
    {
        public Guid Id { get; set; }
        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }

        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }
    }
}