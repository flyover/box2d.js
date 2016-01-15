/**
 * @type {Object}
 */
var box2d;

/**
 * @return {void}
 * @param {...} args
 */
box2d.b2Log;

/**
 * @constructor
 * @param {number=} major
 * @param {number=} minor
 * @param {number=} revision
 */
box2d.b2Version;
/**
 * @type {number}
 */
box2d.b2Version.prototype.major;
/**
 * @type {number}
 */
box2d.b2Version.prototype.minor;
/**
 * @type {number}
 */
box2d.b2Version.prototype.revision;

/**
 * @const
 * @type {box2d.b2Version}
 */
box2d.b2_version;
/**
 * @const
 * @type {number}
 */
box2d.b2_changelist;

/**
 * @const
 * @type {number}
 */
box2d.b2_maxFloat;
/**
 * @const
 * @type {number}
 */
box2d.b2_epsilon;
/**
 * @const
 * @type {number}
 */
box2d.b2_epsilon_sq;
/**
 * @const
 * @type {number}
 */
box2d.b2_pi;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxManifoldPoints;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxPolygonVertices;
/**
 * @const
 * @type {number}
 */
box2d.b2_aabbExtension;
/**
 * @const
 * @type {number}
 */
box2d.b2_aabbMultiplier;
/**
 * @const
 * @type {number}
 */
box2d.b2_linearSlop;
/**
 * @const
 * @type {number}
 */
box2d.b2_angularSlop;
/**
 * @const
 * @type {number}
 */
box2d.b2_polygonRadius;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxSubSteps;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxTOIContacts;
/**
 * @const
 * @type {number}
 */
box2d.b2_velocityThreshold;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxLinearCorrection;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxAngularCorrection;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxTranslation;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxTranslationSquared;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxRotation;
/**
 * @const
 * @type {number}
 */
box2d.b2_maxRotationSquared;
/**
 * @const
 * @type {number}
 */
box2d.b2_baumgarte;
/**
 * @const
 * @type {number}
 */
box2d.b2_toiBaumgarte;
/**
 * @const
 * @type {number}
 */
box2d.b2_timeToSleep;
/**
 * @const
 * @type {number}
 */
box2d.b2_linearSleepTolerance;
/**
 * @const
 * @type {number}
 */
box2d.b2_angularSleepTolerance;

box2d.b2Clamp;

/**
 * @constructor
 * @param {number|Float32Array|Array.<number>=} a0
 * @param {number=} a1
 */
box2d.b2Vec2;
/**
 * @type {number}
 */
box2d.b2Vec2.prototype.x;
/**
 * @type {number}
 */
box2d.b2Vec2.prototype.y;
/**
 * @return {box2d.b2Rot}
 */
box2d.b2Vec2.prototype.Clone;
/**
 * @return {box2d.b2Vec2}
 * @param {number} x
 * @param {number} y
 */
box2d.b2Vec2.prototype.Set;
/**
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SetZero;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} other
 */
box2d.b2Vec2.prototype.Copy;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfAdd;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfSub;
/**
 * @return {box2d.b2Vec2}
 * @param {number} s
 */
box2d.b2Vec2.prototype.SelfMul;
/**
 * @return {number}
 */
box2d.b2Vec2.prototype.Normalize;
/**
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SelfNormalize;
/**
 * @return {box2d.b2Vec2}
 * @param {number} c
 * @param {number} s
 */
box2d.b2Vec2.prototype.SelfRotate;
/**
 * @return {box2d.b2Vec2}
 * @param {number} a
 */
box2d.b2Vec2.prototype.SelfRotateAngle;
/**
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SelfNeg;
/**
 * @return {number}
 */
box2d.b2Vec2.prototype.Length;
/**
 * @return {number}
 */
box2d.b2Vec2.prototype.LengthSquared;

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 * @param {number=} z
 */
box2d.b2Vec3;
/**
 * @type {number}
 */
box2d.b2Vec3.prototype.x;
/**
 * @type {number}
 */
box2d.b2Vec3.prototype.y;
/**
 * @type {number}
 */
box2d.b2Vec3.prototype.z;

/**
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2Dot_V2_V2;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Sub_V2_V2;

/**
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2Distance;

/**
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2DistanceSquared;

/**
 * @constructor
 */
box2d.b2Rot;
/**
 * @type {number}
 */
box2d.b2Rot.prototype.angle;
/**
 * @type {number}
 */
box2d.b2Rot.prototype.s;
/**
 * @type {number}
 */
box2d.b2Rot.prototype.c;
/**
 * @type {box2d.b2Rot}
 */
box2d.b2Rot.IDENTITY;
/**
 * @return {box2d.b2Rot}
 */
box2d.b2Rot.prototype.Clone;
/**
 * @return {box2d.b2Rot}
 * @param {box2d.b2Rot} other
 */
box2d.b2Rot.prototype.Copy;
/**
 * @return {box2d.b2Rot}
 * @param {number} angle
 */
box2d.b2Rot.prototype.Set;
/**
 * @return {box2d.b2Rot}
 * @param {number} angle
 */
box2d.b2Rot.prototype.SetAngle;
/**
 * @return {box2d.b2Rot}
 */
box2d.b2Rot.prototype.SetIdentity;
/**
 * @return {number}
 */
box2d.b2Rot.prototype.GetAngle;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2Rot.prototype.GetXAxis;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2Rot.prototype.GetYAxis;

/**
 * @constructor
 */
box2d.b2Transform;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2Transform.prototype.p;
/**
 * @type {box2d.b2Rot}
 */
box2d.b2Transform.prototype.q;

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Add_V2_V2;

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Sub_V2_V2;

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Transform} T
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul_X_V2;

/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Transform} T
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2MulT_X_V2;

/**
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform} A
 * @param {box2d.b2Transform} B
 * @param {box2d.b2Transform} out
 */
box2d.b2Mul_X_X;

/**
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform} A
 * @param {box2d.b2Transform} B
 * @param {box2d.b2Transform} out
 */
box2d.b2MulT_X_X;

/**
 * @constructor
 */
box2d.b2MassData;
/**
 * @type {number}
 */
box2d.b2MassData.prototype.mass;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2MassData.prototype.center;
/**
 * @type {number}
 */
box2d.b2MassData.prototype.I;

/**
 * @typedef {box2d.b2ShapeType}
 */
box2d.b2ShapeType;
box2d.b2ShapeType.e_unknown;
box2d.b2ShapeType.e_circleShape;
box2d.b2ShapeType.e_edgeShape;
box2d.b2ShapeType.e_polygonShape;
box2d.b2ShapeType.e_chainShape;
box2d.b2ShapeType.e_shapeTypeCount;

/**
 * @constructor
 */
box2d.b2Shape;

/**
 * @constructor
 * @extends {box2d.b2Shape}
 * @param {number=} radius
 */
box2d.b2CircleShape;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2CircleShape.prototype.m_p;

/**
 * @return {void}
 * @param {box2d.b2MassData} massData
 * @param {number} density
 */
box2d.b2CircleShape.prototype.ComputeMass;

/**
 * @constructor
 * @extends {box2d.b2Shape}
 */
box2d.b2EdgeShape;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex1;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex2;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex0;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex3;
/**
 * @type {boolean}
 */
box2d.b2EdgeShape.prototype.m_hasVertex0;
/**
 * @type {boolean}
 */
box2d.b2EdgeShape.prototype.m_hasVertex3;
/**
 * @return {box2d.b2EdgeShape}
 * @param {box2d.b2Vec2} v1
 * @param {box2d.b2Vec2} v2
 */
box2d.b2EdgeShape.prototype.Set;

/**
 * @constructor
 * @extends {box2d.b2Shape}
 */
box2d.b2PolygonShape;
/**
 * @return {box2d.b2PolygonShape}
 * @param {Array.<box2d.b2Vec2>} vertices
 * @param {number=} count
 */
box2d.b2PolygonShape.prototype.Set;
/**
 * @return {box2d.b2PolygonShape}
 * @param {number} hx
 * @param {number} hy
 * @param {box2d.b2Vec2=} center
 * @param {number=} angle
 */
box2d.b2PolygonShape.prototype.SetAsBox;
/**
 * @return {box2d.b2PolygonShape}
 * @param {number} hx
 * @param {number} hy
 * @param {box2d.b2Vec2} center
 * @param {number} angle
 */
box2d.b2PolygonShape.prototype.SetAsOrientedBox;

/**
 * @return {void}
 * @param {box2d.b2MassData} massData
 * @param {number} density
 */
box2d.b2PolygonShape.prototype.ComputeMass;

/**
 * @constructor
 * @extends {box2d.b2Shape}
 */
box2d.b2ChainShape;
/**
 * @return {box2d.b2ChainShape}
 * @param {Array.<box2d.b2Vec2>} vertices
 * @param {number=} count
 */
box2d.b2ChainShape.prototype.CreateLoop;
/**
 * @return {box2d.b2ChainShape}
 * @param {Array.<box2d.b2Vec2>} vertices
 * @param {number=} count
 */
box2d.b2ChainShape.prototype.CreateChain;

/**
 * @constructor
 */
box2d.b2RayCastInput;

/**
 * @constructor
 */
box2d.b2RayCastOutput;

/**
 * @constructor
 */
box2d.b2Filter;
/**
 * @type number
 */
box2d.b2Filter.prototype.categoryBits;
/**
 * @type number
 */
box2d.b2Filter.prototype.maskBits;
/**
 * @type number
 */
box2d.b2Filter.prototype.groupIndex;

/**
 * @constructor
 */
box2d.b2FixtureDef;
/**
 * @type {box2d.b2Shape}
 */
box2d.b2FixtureDef.prototype.shape;
/**
 * @type {*}
 */
box2d.b2FixtureDef.prototype.userData;
/**
 * @type {number}
 */
box2d.b2FixtureDef.prototype.friction;
/**
 * @type {number}
 */
box2d.b2FixtureDef.prototype.restitution;
/**
 * @type {number}
 */
box2d.b2FixtureDef.prototype.density;
/**
 * @type {boolean}
 */
box2d.b2FixtureDef.prototype.isSensor;
/**
 * @type {box2d.b2Filter}
 */
box2d.b2FixtureDef.prototype.filter;

/**
 * @constructor
 */
box2d.b2Fixture;
/**
 * @return {box2d.b2ShapeType}
 */
box2d.b2Fixture.prototype.GetType;
/**
 * @return {box2d.b2Shape}
 */
box2d.b2Fixture.prototype.GetShape;
/**
 * @return {boolean}
 */
box2d.b2Fixture.prototype.IsSensor;
/**
 * @return {box2d.b2Filter}
 */
box2d.b2Fixture.prototype.GetFilterData;
/**
 * @return {*}
 */
box2d.b2Fixture.prototype.GetUserData;
/**
 * @param {*} data
 */
box2d.b2Fixture.prototype.SetUserData;
/**
 * @return {box2d.b2Body}
 */
box2d.b2Fixture.prototype.GetBody;
/**
 * @return {box2d.b2Fixture}
 */
box2d.b2Fixture.prototype.GetNext;
/**
 * @return {void}
 * @param {number} density
 */
box2d.b2Fixture.prototype.SetDensity;
/**
 * @return {number}
 */
box2d.b2Fixture.prototype.GetDensity;
/**
 * @return {number}
 */
box2d.b2Fixture.prototype.GetFriction;
/**
 * @return {void}
 * @param {number} friction
 */
box2d.b2Fixture.prototype.SetFriction;
/**
 * @return {number}
 */
box2d.b2Fixture.prototype.GetRestitution;
/**
 * @return {void}
 * @param {number} restitution
 */
box2d.b2Fixture.prototype.SetRestitution;
/**
 * @return {boolean}
 * @param {box2d.b2Vec2} p
 */
box2d.b2Fixture.prototype.TestPoint;
/**
 * @return {boolean}
 * @param {box2d.b2RayCastOutput} output
 * @param {box2d.b2RayCastInput} input
 * @param {number} childIndex
 */
box2d.b2Fixture.prototype.RayCast;
/**
 * @return {box2d.b2MassData}
 * @param {box2d.b2MassData=} massData
 */
box2d.b2Fixture.prototype.GetMassData;
/**
 * @return {box2d.b2AABB}
 * @param {number} childIndex
 */
box2d.b2Fixture.prototype.GetAABB;
/**
 * @return {void}
 * @param {box2d.b2Filter} filter
 */
box2d.b2Fixture.prototype.SetFilterData;
/**
 * @return {void}
 */
box2d.b2Fixture.prototype.Refilter;
/**
 * @return {void}
 * @param {boolean} sensor
 */
box2d.b2Fixture.prototype.SetSensor;
/**
 * @return {void}
 * @param {number} bodyIndex
 */
box2d.b2Fixture.prototype.Dump;

/**
 * @typedef {box2d.b2BodyType}
 */
box2d.b2BodyType;
box2d.b2BodyType.b2_staticBody;
box2d.b2BodyType.b2_kinematicBody;
box2d.b2BodyType.b2_dynamicBody;

/**
 * @constructor
 */
box2d.b2BodyDef;
/**
 * @type {box2d.b2BodyType}
 */
box2d.b2BodyDef.prototype.type;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2BodyDef.prototype.position;
/**
 * @type {number}
 */
box2d.b2BodyDef.prototype.angle;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2BodyDef.prototype.linearVelocity;
/**
 * @type {number}
 */
box2d.b2BodyDef.prototype.angularVelocity;
/**
 * @type {number}
 */
box2d.b2BodyDef.prototype.linearDamping;
/**
 * @type {number}
 */
box2d.b2BodyDef.prototype.angularDamping;
/**
 * @type {boolean}
 */
box2d.b2BodyDef.prototype.allowSleep;
/**
 * @type {boolean}
 */
box2d.b2BodyDef.prototype.awake;
/**
 * @type {boolean}
 */
box2d.b2BodyDef.prototype.fixedRotation;
/**
 * @type {boolean}
 */
box2d.b2BodyDef.prototype.bullet;
/**
 * @type {boolean}
 */
box2d.b2BodyDef.prototype.active;
/**
 * @type {*}
 */
box2d.b2BodyDef.prototype.userData;
/**
 * @type {number}
 */
box2d.b2BodyDef.prototype.gravityScale;

/**
 * @constructor
 */
box2d.b2Body;
/**
 * @return {box2d.b2Fixture}
 * @param {box2d.b2FixtureDef|box2d.b2Shape} a
 * @param {number=} b
 */
box2d.b2Body.prototype.CreateFixture;
/**
 * @return {box2d.b2Fixture}
 * @param {box2d.b2FixtureDef} def
 */
box2d.b2Body.prototype.CreateFixture_Def;
/**
 * @return {box2d.b2Fixture}
 * @param {box2d.b2Shape} shape
 * @param {number} density
 */
box2d.b2Body.prototype.CreateFixture_Shape_Density;
/**
 * @return {void}
 * @param {box2d.b2Fixture} fixture
 */
box2d.b2Body.prototype.DestroyFixture;
/**
 * @return {void}
 * @param {box2d.b2Vec2} position
 * @param {number} angle
 */
box2d.b2Body.prototype.SetTransform;
/**
 * @return {void}
 * @param {box2d.b2Vec2} position
 * @param {number} angle
 */
box2d.b2Body.prototype.SetTransform_V2_A;
/**
 * @return {void}
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 */
box2d.b2Body.prototype.SetTransform_X_Y_A;
/**
 * @return {void}
 * @param {box2d.b2Vec2} position
 * @param {number} angle
 */
box2d.b2Body.prototype.SetTransform_X;
/**
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform=} out
 */
box2d.b2Body.prototype.GetTransform;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2=} out
 */
box2d.b2Body.prototype.GetPosition;
/**
 * @return {void}
 * @param {box2d.b2Vec2} position
 */
box2d.b2Body.prototype.SetPosition;
/**
 * @return {void}
 * @param {number} x
 * @param {number} y
 */
box2d.b2Body.prototype.SetPositionXY;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetAngle;
/**
 * @return {void}
 * @param {number} angle
 */
box2d.b2Body.prototype.SetAngle;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2=} out
 */
box2d.b2Body.prototype.GetWorldCenter;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2=} out
 */
box2d.b2Body.prototype.GetLocalCenter;
/**
 * @return {void}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Body.prototype.SetLinearVelocity;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2=} out
 */
box2d.b2Body.prototype.GetLinearVelocity;
/**
 * @return {void}
 * @param {number} w
 */
box2d.b2Body.prototype.SetAngularVelocity;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetAngularVelocity;
/**
 * @return {box2d.b2BodyDef}
 * @param {box2d.b2BodyDef} bd
 */
box2d.b2Body.prototype.GetDefinition;
/**
 * @return {void}
 * @param {box2d.b2Vec2} force
 * @param {box2d.b2Vec2} point
 * @param {boolean=} wake
 */
box2d.b2Body.prototype.ApplyForce;
/**
 * @return {void}
 * @param {box2d.b2Vec2} force
 * @param {boolean=} wake
 */
box2d.b2Body.prototype.ApplyForceToCenter;
/**
 * @return {void}
 * @param {number} torque
 * @param {boolean=} wake
 */
box2d.b2Body.prototype.ApplyTorque;
/**
 * @return {void}
 * @param {box2d.b2Vec2} impulse
 * @param {box2d.b2Vec2} point
 * @param {boolean=} wake
 */
box2d.b2Body.prototype.ApplyLinearImpulse;
/**
 * @return {void}
 * @param {number} impulse
 * @param {boolean=} wake
 */
box2d.b2Body.prototype.ApplyAngularImpulse;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetMass;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetInertia;
/**
 * @return {box2d.b2MassData}
 * @param {box2d.b2MassData} data
 */
box2d.b2Body.prototype.GetMassData;
/**
 * @return {void}
 * @param {box2d.b2MassData} massData
 */
box2d.b2Body.prototype.SetMassData;
/**
 * @return {void}
 */
box2d.b2Body.prototype.ResetMassData;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} localPoint
 * @param {box2d.b2Vec2} out
 */
box2d.b2Body.prototype.GetWorldPoint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} localVector
 * @param {box2d.b2Vec2} out
 */
box2d.b2Body.prototype.GetWorldVector;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} worldPoint
 * @param {box2d.b2Vec2} out
 */
box2d.b2Body.prototype.GetLocalPoint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} worldVector
 * @param {box2d.b2Vec2} out
 */
box2d.b2Body.prototype.GetLocalVector;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} worldPoint
 * @param {box2d.b2Vec2} out
 */
box2d.b2Body.prototype.GetLinearVelocityFromWorldPoint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} localPoint
 * @param {box2d.b2Vec2} out
 */
box2d.b2Body.prototype.GetLinearVelocityFromLocalPoint;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetLinearDamping;
/**
 * @param {number} linearDamping
 */
box2d.b2Body.prototype.SetLinearDamping;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetAngularDamping;
/**
 * @return {void}
 * @param {number} angularDamping
 */
box2d.b2Body.prototype.SetAngularDamping;
/**
 * @return {number}
 */
box2d.b2Body.prototype.GetGravityScale;
/**
 * @return {void}
 * @param {number} scale
 */
box2d.b2Body.prototype.SetGravityScale;
/**
 * @return {void}
 * @param {box2d.b2BodyType} type
 */
box2d.b2Body.prototype.SetType;
/**
 * @return {box2d.b2BodyType}
 */
box2d.b2Body.prototype.GetType;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2Body.prototype.SetBullet;
/**
 * @return {boolean}
 */
box2d.b2Body.prototype.IsBullet;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2Body.prototype.SetSleepingAllowed;
/**
 * @return {boolean}
 */
box2d.b2Body.prototype.IsSleepingAllowed;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2Body.prototype.SetAwake;
/**
 * @return {boolean}
 */
box2d.b2Body.prototype.IsAwake;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2Body.prototype.SetActive;
/**
 * @return {boolean}
 */
box2d.b2Body.prototype.IsActive;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2Body.prototype.SetFixedRotation;
/**
 * @return {boolean}
 */
box2d.b2Body.prototype.IsFixedRotation;
/**
 * @return {box2d.b2Body}
 */
box2d.b2Body.prototype.GetNext;
/**
 * @return {*}
 */
box2d.b2Body.prototype.GetUserData;
/**
 * @return {void}
 * @param {*} data
 */
box2d.b2Body.prototype.SetUserData;
/**
 * @return {box2d.b2World}
 */
box2d.b2Body.prototype.GetWorld;

/**
 * @typedef {box2d.b2JointType}
 */
box2d.b2JointType;
box2d.b2JointType.e_unknownJoint;
box2d.b2JointType.e_revoluteJoint;
box2d.b2JointType.e_prismaticJoint;
box2d.b2JointType.e_distanceJoint;
box2d.b2JointType.e_pulleyJoint;
box2d.b2JointType.e_mouseJoint;
box2d.b2JointType.e_gearJoint;
box2d.b2JointType.e_wheelJoint;
box2d.b2JointType.e_weldJoint;
box2d.b2JointType.e_frictionJoint;
box2d.b2JointType.e_ropeJoint;
box2d.b2JointType.e_motorJoint;
box2d.b2JointType.e_areaJoint;

/**
 * @constructor
 */
box2d.b2JointDef;
/**
 * @type {box2d.b2JointType}
 */
box2d.b2JointDef.prototype.type;
/**
 * @type {*}
 */
box2d.b2JointDef.prototype.userData;
/**
 * @type {box2d.b2Body}
 */
box2d.b2JointDef.prototype.bodyA;
/**
 * @type {box2d.b2Body}
 */
box2d.b2JointDef.prototype.bodyB;
/**
 * @type {boolean}
 */
box2d.b2JointDef.prototype.collideConnected;

/**
 * @constructor
 * @param {box2d.b2JointDef} def
 */
box2d.b2Joint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2Joint.prototype.GetAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2Joint.prototype.GetAnchorB;
/**
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2Joint.prototype.GetReactionForce;
/**
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2Joint.prototype.GetReactionTorque;
/**
 * @return {box2d.b2JointType}
 */
box2d.b2Joint.prototype.GetType;
/**
 * @return {box2d.b2Body}
 */
box2d.b2Joint.prototype.GetBodyA;
/**
 * @return {box2d.b2Body}
 */
box2d.b2Joint.prototype.GetBodyB;
/**
 * @return {box2d.b2Joint}
 */
box2d.b2Joint.prototype.GetNext;
/**
 * @return {*}
 */
box2d.b2Joint.prototype.GetUserData;
/**
 * @return {void}
 * @param {*} data
 */
box2d.b2Joint.prototype.SetUserData;
/**
 * @return {boolean}
 */
box2d.b2Joint.prototype.GetCollideConnected;
/**
 * @return {void}
 */
box2d.b2Joint.prototype.Dump;
/**
 * @return {boolean}
 */
box2d.b2Joint.prototype.IsActive;
/**
 * @return {void}
 * @param {box2d.b2Vec2} newOrigin
 */
box2d.b2Joint.prototype.ShiftOrigin;

/**
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2RevoluteJointDef;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJointDef.prototype.localAnchorA;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJointDef.prototype.localAnchorB;
/**
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.referenceAngle;
/**
 * @type {boolean}
 */
box2d.b2RevoluteJointDef.prototype.enableLimit;
/**
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.lowerAngle;
/**
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.upperAngle;
/**
 * @type {boolean}
 */
box2d.b2RevoluteJointDef.prototype.enableMotor;
/**
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.motorSpeed;
/**
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.maxMotorTorque;
/**
 * @return {void}
 * @param {box2d.b2Body} bA
 * @param {box2d.b2Body} bB
 * @param {box2d.b2Vec2} anchor
 */
box2d.b2RevoluteJointDef.prototype.Initialize;

/**
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2RevoluteJointDef} def
 */
box2d.b2RevoluteJoint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RevoluteJoint.prototype.GetAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RevoluteJoint.prototype.GetAnchorB;
/**
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2RevoluteJoint.prototype.GetReactionForce;
/**
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2RevoluteJoint.prototype.GetReactionTorque;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RevoluteJoint.prototype.GetLocalAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2=} out
 */
box2d.b2RevoluteJoint.prototype.GetLocalAnchorB;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetReferenceAngle;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetJointAngle;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetJointSpeed;
/**
 * @return {boolean}
 */
box2d.b2RevoluteJoint.prototype.IsMotorEnabled;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2RevoluteJoint.prototype.EnableMotor;
/**
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2RevoluteJoint.prototype.GetMotorTorque;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetMotorSpeed;
/**
 * @return {void}
 * @param {number} torque
 */
box2d.b2RevoluteJoint.prototype.SetMaxMotorTorque;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetMaxMotorTorque;
/**
 * @return {boolean}
 */
box2d.b2RevoluteJoint.prototype.IsLimitEnabled;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2RevoluteJoint.prototype.EnableLimit;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetLowerLimit;
/**
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetUpperLimit;
/**
 * @return {void}
 * @param {number} lower
 * @param {number} upper
 */
box2d.b2RevoluteJoint.prototype.SetLimits;
/**
 * @return {void}
 * @param {number} speed
 */
box2d.b2RevoluteJoint.prototype.SetMotorSpeed;
/**
 * @return {void}
 */
box2d.b2RevoluteJoint.prototype.Dump;

/**
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2PrismaticJointDef;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJointDef.prototype.localAnchorA;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJointDef.prototype.localAnchorB;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJointDef.prototype.localAxisA;
/**
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.referenceAngle;
/**
 * @type {boolean}
 */
box2d.b2PrismaticJointDef.prototype.enableLimit;
/**
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.lowerTranslation;
/**
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.upperTranslation;
/**
 * @type {boolean}
 */
box2d.b2PrismaticJointDef.prototype.enableMotor;
/**
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.maxMotorForce;
/**
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.motorSpeed;
/**
 * @return {void}
 * @param {box2d.b2Body} bA
 * @param {box2d.b2Body} bB
 * @param {box2d.b2Vec2} anchor
 * @param {box2d.b2Vec2} axis
 */
box2d.b2PrismaticJointDef.prototype.Initialize;

/**
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2PrismaticJointDef} def
 */
box2d.b2PrismaticJoint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetAnchorB;
/**
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetReactionForce;
/**
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2PrismaticJoint.prototype.GetReactionTorque;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetLocalAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetLocalAnchorB;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetLocalAxisA;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetReferenceAngle;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetJointTranslation;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetJointSpeed;
/**
 * @return {boolean}
 */
box2d.b2PrismaticJoint.prototype.IsLimitEnabled;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2PrismaticJoint.prototype.EnableLimit;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetLowerLimit;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetUpperLimit;
/**
 * @return {void}
 * @param {number} upper
 * @param {number} lower
 */
box2d.b2PrismaticJoint.prototype.SetLimits;
/**
 * @return {boolean}
 */
box2d.b2PrismaticJoint.prototype.IsMotorEnabled;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2PrismaticJoint.prototype.EnableMotor;
/**
 * @return {void}
 * @param {number} speed
 */
box2d.b2PrismaticJoint.prototype.SetMotorSpeed;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetMotorSpeed;
/**
 * @return {void}
 * @param {number} force
 */
box2d.b2PrismaticJoint.prototype.SetMaxMotorForce;
/**
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetMaxMotorForce;
/**
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2PrismaticJoint.prototype.GetMotorForce;
/**
 * @return {void}
 */
box2d.b2PrismaticJoint.prototype.Dump;

/**
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2MouseJointDef;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJointDef.prototype.target;

/**
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2MouseJointDef} def
 */
box2d.b2MouseJoint;

/**
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2WeldJointDef;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJointDef.prototype.localAnchorA;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJointDef.prototype.localAnchorB;
/**
 * @type {number}
 */
box2d.b2WeldJointDef.prototype.referenceAngle;
/**
 * @type {number}
 */
box2d.b2WeldJointDef.prototype.frequencyHz;
/**
 * @type {number}
 */
box2d.b2WeldJointDef.prototype.dampingRatio;
/**
 * @return {void}
 * @param {box2d.b2Body} bA
 * @param {box2d.b2Body} bB
 * @param {box2d.b2Vec2} anchor
 */
box2d.b2WeldJointDef.prototype.Initialize;

/**
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2WeldJointDef} def
 */
box2d.b2WeldJoint;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WeldJoint.prototype.GetAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WeldJoint.prototype.GetAnchorB;
/**
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2WeldJoint.prototype.GetReactionForce;
/**
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2WeldJoint.prototype.GetReactionTorque;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WeldJoint.prototype.GetLocalAnchorA;
/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WeldJoint.prototype.GetLocalAnchorB;
/**
 * @return {number}
 */
box2d.b2WeldJoint.prototype.GetReferenceAngle;
/**
 * @return {void}
 * @param {number} speed
 */
box2d.b2WeldJoint.prototype.SetFrequency;
/**
 * @return {number}
 */
box2d.b2WeldJoint.prototype.GetFrequency;
/**
 * @return {void}
 * @param {number} force
 */
box2d.b2WeldJoint.prototype.SetDampingRatio;
/**
 * @return {number}
 */
box2d.b2WeldJoint.prototype.GetDampingRatio;
/**
 * @return {void}
 */
box2d.b2WeldJoint.prototype.Dump;

/**
 * @constructor
 */
box2d.b2Contact;
/**
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2Contact.prototype.SetEnabled;
/**
 * @return {box2d.b2Fixture}
 */
box2d.b2Contact.prototype.GetFixtureA;
/**
 * @return {box2d.b2Fixture}
 */
box2d.b2Contact.prototype.GetFixtureB;

/**
 * @constructor
 */
box2d.b2ManifoldPoint;

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2ManifoldPoint.prototype.localPoint;

/**
 * @type {number}
 */
box2d.b2ManifoldPoint.prototype.normalImpulse;

/**
 * @type {number}
 */
box2d.b2ManifoldPoint.prototype.tangentImpulse;

/**
 * @type {*}
 */
box2d.b2ManifoldPoint.prototype.id;

/**
 * @typedef {box2d.b2ManifoldType}
 */
box2d.b2ManifoldType;
box2d.b2ManifoldType.e_circles;
box2d.b2ManifoldType.e_faceA;
box2d.b2ManifoldType.e_faceB;

/**
 * @constructor
 */
box2d.b2Manifold;

/**
 * @type {Array.< box2d.b2ManifoldPoint >}
 */
box2d.b2Manifold.prototype.points;

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2Manifold.prototype.localNormal;

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2Manifold.prototype.localPoint;

/**
 * @type {box2d.b2ManifoldType}
 */
box2d.b2Manifold.prototype.type;

/**
 * @type {number}
 */
box2d.b2Manifold.prototype.pointCount;

/**
 * @constructor
 */
box2d.b2WorldManifold;

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2WorldManifold.prototype.normal;

/**
 * @type {Array.< box2d.b2Vec2 >}
 */
box2d.b2WorldManifold.prototype.points;

/**
 * @type {Array.< number >}
 */
box2d.b2WorldManifold.prototype.separations;

/**
 * @constructor
 */
box2d.b2AABB;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.lowerBound;
/**
 * @type {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.upperBound;
/**
 * @return {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.GetCenter;
/**
 * @return {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.GetExtents;

/**
 * @constructor
 */
box2d.b2DestructionListener;

/**
 * @constructor
 */
box2d.b2ContactFilter;

/**
 * @constructor
 */
box2d.b2ContactImpulse;

/**
 * @constructor
 */
box2d.b2ContactListener;

/**
 * @constructor
 */
box2d.b2Color;
/**
 * @type {number}
 */
box2d.b2Color.prototype.r;
/**
 * @type {number}
 */
box2d.b2Color.prototype.g;
/**
 * @type {number}
 */
box2d.b2Color.prototype.b;

/**
 * @typedef {box2d.b2DrawFlags}
 */
box2d.b2DrawFlags;
box2d.b2DrawFlags.e_none;
box2d.b2DrawFlags.e_shapeBit;
box2d.b2DrawFlags.e_jointBit;
box2d.b2DrawFlags.e_aabbBit;
box2d.b2DrawFlags.e_pairBit;
box2d.b2DrawFlags.e_centerOfMassBit;
box2d.b2DrawFlags.e_controllerBit;
box2d.b2DrawFlags.e_all;

/**
 * @constructor
 */
box2d.b2Draw;
/**
 * @return {void}
 * @param {box2d.b2DrawFlags} flags
 */
box2d.b2Draw.prototype.SetFlags;
/**
 * @return {box2d.b2DrawFlags}
 */
box2d.b2Draw.prototype.GetFlags;
/**
 * @return {void}
 * @param {box2d.b2DrawFlags} flags
 */
box2d.b2Draw.prototype.AppendFlags;
/**
 * @return {void}
 * @param {box2d.b2DrawFlags} flags
 */
box2d.b2Draw.prototype.ClearFlags;

/**
 * @constructor
 * @param {box2d.b2Vec2} gravity
 */
box2d.b2World;
box2d.b2World.prototype.SetGravity;
box2d.b2World.prototype.SetDestructionListener;
box2d.b2World.prototype.SetContactFilter;
box2d.b2World.prototype.SetContactListener;
box2d.b2World.prototype.SetDebugDraw;
box2d.b2World.prototype.CreateBody;
box2d.b2World.prototype.DestroyBody;
box2d.b2World.prototype.CreateJoint;
box2d.b2World.prototype.DestroyJoint;
box2d.b2World.prototype.Step;
box2d.b2World.prototype.QueryAABB;
box2d.b2World.prototype.DrawDebugData;
box2d.b2World.prototype.RayCast;
box2d.b2World.prototype.GetBodyList;
box2d.b2World.prototype.GetJointList;
box2d.b2World.prototype.GetContactList;

box2d.b2World.prototype.CreateParticleSystem;
box2d.b2World.prototype.CalculateReasonableParticleIterations;

box2d.b2CalculateParticleIterations;
box2d.b2ParticleFlag;
box2d.b2ParticleFlag.b2_waterParticle;
box2d.b2ParticleFlag.b2_zombieParticle;
box2d.b2ParticleFlag.b2_wallParticle;
box2d.b2ParticleFlag.b2_springParticle;
box2d.b2ParticleFlag.b2_elasticParticle;
box2d.b2ParticleFlag.b2_viscousParticle;
box2d.b2ParticleFlag.b2_powderParticle;
box2d.b2ParticleFlag.b2_tensileParticle;
box2d.b2ParticleFlag.b2_colorMixingParticle;
box2d.b2ParticleFlag.b2_destructionListenerParticle;
box2d.b2ParticleFlag.b2_barrierParticle;
box2d.b2ParticleFlag.b2_staticPressureParticle;
box2d.b2ParticleFlag.b2_reactiveParticle;
box2d.b2ParticleFlag.b2_repulsiveParticle;
box2d.b2ParticleFlag.b2_fixtureContactListenerParticle;
box2d.b2ParticleFlag.b2_particleContactListenerParticle;
box2d.b2ParticleFlag.b2_fixtureContactFilterParticle;
box2d.b2ParticleFlag.b2_particleContactFilterParticle;
/**
 * @constructor
 */
box2d.b2ParticleColor;
box2d.b2ParticleColor.prototype.r;
box2d.b2ParticleColor.prototype.g;
box2d.b2ParticleColor.prototype.b;
box2d.b2ParticleColor.prototype.a;
box2d.b2ParticleDef;
box2d.b2ParticleDef.prototype.velocity;
box2d.b2ParticleGroupDef;
box2d.b2ParticleGroup;
box2d.b2ParticleSystemDef;
box2d.b2ParticleSystem;
box2d.b2ParticleSystem.prototype.CreateParticle;
box2d.b2ParticleSystem.prototype.GetRadius;
box2d.b2ParticleSystem.prototype.GetParticleCount;
box2d.b2ParticleSystem.prototype.GetPositionBuffer;
box2d.b2ParticleSystem.prototype.GetVelocityBuffer;
