namespace GestureRecognition
{
    using System;
    using Microsoft.Kinect;

    /// <summary>
    /// the state for the system of Gesture Recognition
    /// </summary>
    enum SystemState
    {
        QUIT,  // the state for quitting the system
        SUCC,  // the state for interpreting the gesture successfully
        FAIL,  // the state for interpreting the gesture failedly
    }

    /// <summary>
    /// left and right hands' types and positions(in the depth camera world) directly recognized by the Kinect sensor
    /// passing from the Recognizer to the Interpreter
    /// </summary>
    class Gesture
    {
        public static HandState handLeftType = HandState.NotTracked;
        public static HandState handRightType = HandState.NotTracked;
        public static CameraSpacePoint handLeftPosition = new CameraSpacePoint();
        public static CameraSpacePoint handRightPosition = new CameraSpacePoint();
    }

    /// <summary>
    /// the operation instruction interpreted by the Interpreter
    /// passing from the Interpreter to the Transmitter
    /// </summary>
    class Operation
    {
        public static string instruction = "";
    }

    class GestureRecognition
    {
        /// <summary>
        /// systemState describes the state of the system, such as QUIT, 
        /// </summary>
        public static SystemState systemState = SystemState.SUCC;

        // public static 

        static void Main(string[] args)
        {
            //
            Recognizer recognizer = new Recognizer();

            Interpreter interpreter = new Interpreter();

            Transmitter transmitter = new Transmitter();

            while (true)
            {
                if (systemState == SystemState.QUIT)
                {
                    Console.WriteLine("...You have closed the system!");
                    break;
                }
            }
        }
    }
}
