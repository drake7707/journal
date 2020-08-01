using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Dashboard
{
    public interface IWebsocketManager
    {

        void Send(string message);
    }
}
