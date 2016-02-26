namespace GestureRecognition
{
    using System;
    using Microsoft.Kinect;

    class Recognizer : IDisposable
    {
        private static KinectSensor kinectSensor = null;

        public static CoordinateMapper coordinateMapper = null;

        public static DepthFrameSource depthFrameSource = null;

        private static BodyFrameSource bodyFrameSource = null;

        private static BodyFrameReader bodyframereader = null;

        /// <summary>
        /// open the kinect sensor
        /// </summary>
        private static void openKinectSensor()
        {
            kinectSensor.Open();

            bodyframereader = kinectSensor.BodyFrameSource.OpenReader();

            if (bodyframereader != null)
            {
                bodyframereader.FrameArrived += bodyframereader_FrameArrived;
            }
        }

        /// <summary>
        /// Initialize the Kinect Sensor
        /// </summary>
        public Recognizer()
        {
            // Set the variables of the Kinect sensor
            kinectSensor = KinectSensor.GetDefault();
            coordinateMapper = kinectSensor.CoordinateMapper;
            depthFrameSource = kinectSensor.DepthFrameSource;
            bodyFrameSource = kinectSensor.BodyFrameSource;

            // Open the Kinect sensor
            openKinectSensor();

            if (bodyframereader == null)
            {
                Console.WriteLine("...Faile to open the Kinect sensor!");
                return;
            }
            Console.WriteLine("...Open the Kinect sensor...");
        }


        static Body[] bodies = null;

        private static void bodyframereader_FrameArrived(object sender, BodyFrameArrivedEventArgs e)
        {
            bool DataRecived = false;

            using (BodyFrame bodyframe = e.FrameReference.AcquireFrame())
            {
                if (bodyframe != null)
                {
                    if (bodies == null)
                    {
                        bodies = new Body[bodyframe.BodyCount];
                    }
                    bodyframe.GetAndRefreshBodyData(bodies);

                    DataRecived = true;
                }
            }

            if (DataRecived)
            {
                foreach (Body body in bodies)
                {
                    if (body.IsTracked)
                    {
                        // Get the left and right hand positions in the Depth Camera Space
                        Gesture.handLeftPosition = body.Joints[JointType.HandLeft].Position;
                        Gesture.handRightPosition = body.Joints[JointType.HandRight].Position;

                        // Get the left and rigth hand types in the Depth Camera Space
                        Gesture.handLeftType = body.HandLeftState;
                        Gesture.handRightType = body.HandRightState;
                    }
                }
            }
        }

        /// <summary>
        /// close the kinect sensor
        /// </summary>
        private static void closeKinectSensor()
        {
            if (bodyframereader != null)
            {
                bodyframereader.Dispose();
                bodyframereader = null;
            }
            if (kinectSensor != null)
            {
                kinectSensor.Close();
                kinectSensor = null;
            }
        }

        public void Dispose()
        {
            // Close the Kinect sensor
            closeKinectSensor();
            if (kinectSensor != null)
            {
                Console.WriteLine("...Fail to close the Kinect sensor!");
                return;
            }
            Console.WriteLine("...Success to close the Kinect sensor...");
        }
    }
}
