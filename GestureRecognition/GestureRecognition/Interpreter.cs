namespace GestureRecognition
{
    using System;
    using System.Threading;
    using Microsoft.Kinect;

    class Interpreter
    {
        public Interpreter()
        {
            ThreadStart interpret = new ThreadStart(Interpret);

            Thread interpreter = new Thread(interpret) { Name = "Interpreter" };

            interpreter.Start();

            Console.WriteLine("...Start the Interpreter...");
        }

        /// <summary>
        /// Interpret/map the types and positions of gestures into the types and degrees of operations
        /// </summary>
        private static void Interpret()
        {
            while (true)
            {
                Thread.Sleep(20);

                // Control operation for closing the system
                if (Gesture.handRightType == HandState.Lasso && Gesture.handLeftType == HandState.Lasso)
                {
                    // InterpreterState.QUIT;
                    GestureRecognition.systemState = SystemState.QUIT;

                    return;
                }

                // Pointer operation for moving the gesture pointer(s)
                if (Gesture.handRightType == HandState.Open)
                {
                    // Interpret the gesture to the operation
                    string operation = "moveRightPointer";

                    // Get the right hand's position in the Depth Space (in the Kinect Sensor)
                    DepthSpacePoint handRightPositionInDepthSpace = Recognizer.coordinateMapper.MapCameraPointToDepthSpace(Gesture.handRightPosition);
                    // Map the right hand's position to the gesture pointer's position onto the Medium Plain (MP)
                    PointF pointerRightInMP = new PointF();
                    pointerRightInMP.X = handRightPositionInDepthSpace.X / Recognizer.depthFrameSource.FrameDescription.Width;
                    pointerRightInMP.Y = handRightPositionInDepthSpace.Y / Recognizer.depthFrameSource.FrameDescription.Height;

                    if (Gesture.handLeftType == HandState.Open)
                    {
                        // Interpret the gesture to the operation
                        operation = "moveBothPointers";

                        // Get the left hand's position in the Depth Space (in the Kinect Sensor)
                        DepthSpacePoint handLeftPositionInDepthSpace = Recognizer.coordinateMapper.MapCameraPointToDepthSpace(Gesture.handLeftPosition);
                        // Map the left hand's position to the gesture pointer's position onto the Medium Plain (MP)
                        PointF pointerLeftInMP = new PointF();
                        pointerLeftInMP.X = handLeftPositionInDepthSpace.X;
                        pointerLeftInMP.Y = handLeftPositionInDepthSpace.Y;

                        Console.WriteLine("operation: {0}, pointerRightX: {1}, pointerRightY: {2}, pointerLeftX: {3}, pointerLeftY: {4}", operation, pointerRightInMP.X, pointerRightInMP.Y, pointerLeftInMP.X, pointerLeftInMP.Y);

                        lock (Operation.instruction)
                        {
                            Operation.instruction = "{operation:'" + operation + "',pointerRightX:" + pointerRightInMP.X + ",pointerRightY:" + pointerRightInMP.Y + ",pointerLeftX:" + pointerLeftInMP.X + ",pointerLeftY:" + pointerLeftInMP.Y + "}";
                        }

                        continue;
                    }

                    Console.WriteLine("operation: {0}, pointerRightX: {1}, pointerRightY: {2}", operation, pointerRightInMP.X, pointerRightInMP.Y);

                    lock (Operation.instruction)
                    {
                        Operation.instruction = "{operation:'" + operation + "',pointerRightX:" + pointerRightInMP.X + ",pointerRightY:" + pointerRightInMP.Y + "}";
                    }

                    continue;
                }


                // Browse operation for rotating the camera
                if (Gesture.handRightType == HandState.Closed && Gesture.handLeftType == HandState.Closed)
                {
                    // Interpret the gesture to the operation
                    string operation = "rotate";

                    // Interpret the both hands' positions to the rotation axis and the rotation degree
                    float distanceInXaxis = Math.Abs(Gesture.handRightPosition.X - Gesture.handLeftPosition.X);
                    float distanceInYaxis = Math.Abs(Gesture.handRightPosition.Y - Gesture.handLeftPosition.Y);
                    float distanceInZaxis = Math.Abs(Gesture.handRightPosition.Z - Gesture.handLeftPosition.Z);
                    string axis = null;
                    float degree = 0;
                    if (distanceInXaxis > distanceInYaxis && distanceInXaxis > distanceInZaxis)
                    {
                        axis = "Z";
                        degree = (Gesture.handRightPosition.Y - Gesture.handLeftPosition.Y) / distanceInXaxis;
                    }
                    if (distanceInYaxis > distanceInZaxis && distanceInYaxis > distanceInXaxis)
                    {
                        axis = "X";
                        degree = (Gesture.handRightPosition.Z - Gesture.handLeftPosition.Z) / distanceInYaxis;
                    }
                    if (distanceInZaxis > distanceInXaxis && distanceInZaxis > distanceInYaxis)
                    {
                        axis = "Y";
                        degree = (Gesture.handRightPosition.X - Gesture.handLeftPosition.X) / distanceInZaxis;
                    }

                    Console.WriteLine("operation: rotate, axis: {0}, degree: {1}", axis, degree);

                    lock (Operation.instruction)
                    {
                        Operation.instruction = "{operation:'" + operation + "',axis:'" + axis + "',degree:" + degree + "}";
                    }

                    continue;
                }


                // Edit operation for embossing the model
                if (Gesture.handRightType == HandState.Lasso)
                {
                    // Interpret the gesture to the operation
                    string operation = "emboss";

                    // Map the right hand's position in the Camera Space (of the Kinect Sensor) to the embossing point's position onto the Medium Plain
                    /// Get the right hand's position in the Depth Space (in the Kinect Sensor)
                    DepthSpacePoint handRightPositionInDepthSpace = Recognizer.coordinateMapper.MapCameraPointToDepthSpace(Gesture.handRightPosition);
                    /// Map the right hand's position to the embossing point's position onto the Medium Plain (MP)
                    PointF embossingPointInMP = new PointF();
                    embossingPointInMP.X = handRightPositionInDepthSpace.X / Recognizer.depthFrameSource.FrameDescription.Width;
                    embossingPointInMP.Y = handRightPositionInDepthSpace.Y / Recognizer.depthFrameSource.FrameDescription.Height;

                    Console.WriteLine("operation: {0}, embossingPoint.X: {1}, embossingPoint.Y: {2}", operation, embossingPointInMP.X, embossingPointInMP.Y);

                    lock (Operation.instruction)
                    {
                        Operation.instruction = "{operation:'" + operation + "',embossingPointX:" + embossingPointInMP.X + ",embossingPointY:" + embossingPointInMP.Y + "}";
                    }

                    continue;
                }
            }
        }

    }
}
