namespace GestureRecognition
{
    using System;
    using System.Threading;
    using System.Text;
    using System.Net;
    using System.Net.Sockets;

    class Transmitter
    {
        /// <summary>
        /// the ip and port for the Server
        /// </summary>
        private static string server = "114.212.84.19";
        private static int port = 10000;

        /// <summary>
        /// the socket between the current process and the Server
        /// </summary>
        private static Socket socket = null;

        public Transmitter()
        {
            // Connect the socket
            IPEndPoint ipe = new IPEndPoint(IPAddress.Parse(server), port);
            socket = new Socket(ipe.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
            socket.Connect(ipe);

            // Create the Transmitter thread
            ThreadStart transmit = new ThreadStart(Transmit);
            Thread transmitter = new Thread(transmit) { Name = "Transmitter" };
            transmitter.Start();

            if (socket == null)
            {
                Console.WriteLine("...Fail to connect the socket between the current application and the server!");
                return;
            }
            Console.WriteLine("...Success to connect the socket between the current application and the server...");
        }

        private static void Transmit()
        {
            while (true)
            {
                Thread.Sleep(40);

                if (GestureRecognition.systemState == SystemState.QUIT)
                    return;

                lock (Operation.instruction)
                {
                    if (Operation.instruction != "")
                    {
                        Byte[] bytesSent = Encoding.ASCII.GetBytes(Operation.instruction);
                        socket.Send(bytesSent, bytesSent.Length, 0);
                        Operation.instruction = "";
                    }
                }
            }
        }
    }
}
