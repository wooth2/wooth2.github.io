#version 300 es

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

struct Material {
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

struct Light {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

out vec3 LightingColor;

void main() {
  gl.Position = u_projection * u_view * u_model * vec4(aPos, 1.0);
  vec3 fragPos = vec3(u_model * vec4(aPos, 1.0));
  vec3 normal = mat3(transpose(inverse(u_model))) * aNormal;

  // ambient
  vec3 rgb = material.diffuse;
  vec3 ambient = light.ambient * rgb;

  // diffuse
  vec3 norm = normalize(normal);
  vec3 lightDir = normalize(light.position - fragPos);
  float dotNormLight = dot(norm, lightDir);
  float diff = max(dotNormLight, 0.0);
  vec3 diffuse = light.diffuse * diff * rgb;

  // specular
  vec3 viewDir = normalize(u_viewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = 0.0;
  if (dotNormLight > 0.0) {
    spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    }
    vec3 specular = light.specular * spec * material.specular;
    
  // ambient + diffuse + specular
  LightingColor = ambient + diffuse + specular;
  }