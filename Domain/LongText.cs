using System;
using System.Collections.Generic;
using System.Text;

namespace Journal.Domain
{
    [System.AttributeUsage(AttributeTargets.Property, Inherited = true, AllowMultiple = false)]
    public sealed class LongTextAttribute : Attribute
    {
      
    }
}
