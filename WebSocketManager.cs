using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Dashboard;
using Microsoft.AspNetCore.Builder;

namespace Journal
{
    public class WebSocketManager : IWebsocketManager
    {

        private List<WebSocket> sockets = new List<WebSocket>();


        public void SetupWebsockets(IApplicationBuilder app)
        {
            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/events")
                {
                    if (context.WebSockets.IsWebSocketRequest)
                    {
                        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                        lock (sockets) sockets.Add(webSocket);

                        var msg = await ReceiveStringAsync(webSocket);
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                    }
                }
                else
                {
                    await next();
                }

            });
        }



        private static async Task<string> ReceiveStringAsync(WebSocket socket, CancellationToken ct = default(CancellationToken))
        {
            var buffer = new ArraySegment<byte>(new byte[8192]);

            using (var ms = new MemoryStream())
            {
                WebSocketReceiveResult result;
                do
                {
                    ct.ThrowIfCancellationRequested();

                    result = await socket.ReceiveAsync(buffer, ct);
                    ms.Write(buffer.Array, buffer.Offset, result.Count);
                }

                while (!result.EndOfMessage);

                ms.Seek(0, SeekOrigin.Begin);

                if (result.MessageType != WebSocketMessageType.Text)
                {
                    return null;
                }

                // Encoding UTF8: https://tools.ietf.org/html/rfc6455#section-5.6
                using (var reader = new StreamReader(ms, Encoding.UTF8))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }

        //    private async Task HandleWebsocket(HttpContext context, WebSocket webSocket)
        //    {


        //        var buffer = new byte[1024 * 4];
        //        WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        //        while (!result.CloseStatus.HasValue)
        //        {
        //            await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);

        //            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        //        }
        //        await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        //    }

        //    private async Task<(WebSocketReceiveResult, IEnumerable<byte>)> ReceiveFullMessage(
        //WebSocket socket, CancellationToken cancelToken)
        //    {
        //        WebSocketReceiveResult response;
        //        var message = new List<byte>();

        //        var buffer = new byte[4096];
        //        do
        //        {
        //            response = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), cancelToken);
        //            message.AddRange(new ArraySegment<byte>(buffer, 0, response.Count));
        //        } while (!response.EndOfMessage);

        //        return (response, message);
        //    }

        public int OpenConnections => sockets.Where(s => s.State == WebSocketState.Open).Count();
        
        public void Send(string message)
        {
            WebSocket[] socks;
            lock (sockets)
                socks = sockets.ToArray();

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);

            List<Task> tasks = new List<Task>();
            foreach (var s in socks)
            {
                if (s.State == WebSocketState.Open)
                    tasks.Add(s.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None));
            }
            try
            {

                Task.WaitAll(tasks.ToArray());
            }
            catch (AggregateException ex)
            {
                foreach (var iex in ex.InnerExceptions)
                {
                    Console.Error.WriteLine("Error: " + iex.GetType().FullName + " - " + iex.Message);
                }
            }

            lock (sockets) sockets.RemoveAll(s => s.State != WebSocketState.Open && s.State != WebSocketState.Connecting);
        }
    }
}
