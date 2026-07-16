"""Generate complete, front-composed necklace product GLBs."""

import math
import os
import bpy

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "models")


def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for item in list(bpy.data.materials):
        bpy.data.materials.remove(item)


def make_material(name, color, metallic=0, roughness=0.18):
    item = bpy.data.materials.new(name)
    item.diffuse_color = (*color, 1)
    item.metallic = metallic
    item.roughness = roughness
    return item


def smooth(obj):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def chain_curve(material, thickness=0.032, name="Metal chain"):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = thickness
    curve.bevel_resolution = 5
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(4)
    points = [(-2.25, 0, 0.58), (-1.25, 0, -0.35), (0, 0, -0.92), (1.25, 0, -0.35), (2.25, 0, 0.58)]
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def bead(location, radius, material, name):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    smooth(obj)


def torus(location, major, minor, material, name):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=48,
                                     minor_segments=14, location=location, rotation=(math.pi / 2, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    smooth(obj)
    return obj


def export(filename):
    os.makedirs(ROOT, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, filename), export_format="GLB", export_materials="EXPORT")


def base_materials():
    return (
        make_material("Metal", (0.83, 0.62, 0.16), metallic=0.95, roughness=0.18),
        make_material("StonePrimary", (0.82, 0.94, 1.0), roughness=0.04),
    )


reset()
metal, gem = base_materials()
upper = chain_curve(metal, 0.032, "Metal upper chain")
upper.scale = (0.86, 1, 0.86)
upper.location.z = 0.18
chain_curve(metal, 0.034, "Metal lower chain")
export("necklace_silk_studio.glb")

reset()
metal, gem = base_materials()
chain_curve(metal, 0.028)
torus((0, 0, -1.04), 0.25, 0.042, metal, "Metal bezel")
bead((0, -0.035, -1.04), 0.21, gem, "StonePrimary solitaire")
export("necklace_solitaire_studio.glb")

reset()
metal, gem = base_materials()
chain_curve(metal, 0.03)
torus((0, 0, -0.98), 0.10, 0.026, metal, "Metal bail")
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.38, depth=0.085,
                                     location=(0, 0, -1.30), rotation=(math.pi / 2, 0, 0))
medallion = bpy.context.object
medallion.name = "Metal medallion"
medallion.data.materials.append(metal)
smooth(medallion)
torus((0, -0.048, -1.30), 0.25, 0.022, metal, "Metal medallion detail")
export("necklace_medallion_studio.glb")

reset()
metal, gem = base_materials()
chain_curve(metal, 0.028)
center = (0, 0, -1.14)
for index in range(5):
    angle = 2 * math.pi * index / 5 + math.pi / 2
    x = center[0] + 0.24 * math.cos(angle)
    z = center[2] + 0.24 * math.sin(angle)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.16, location=(x, 0, z))
    petal = bpy.context.object
    petal.name = "Metal floral petal"
    petal.scale = (0.75, 0.34, 1.15)
    petal.rotation_euler[1] = angle
    petal.data.materials.append(metal)
    smooth(petal)
bead((0, -0.07, -1.14), 0.12, gem, "StonePrimary floral center")
export("necklace_floral_studio.glb")

reset()
metal, gem = base_materials()
count = 44
for index in range(count):
    angle = math.pi + math.pi * index / (count - 1)
    x = 2.15 * math.cos(angle)
    z = 0.88 * math.sin(angle)
    link = torus((x, 0, z), 0.085, 0.027, metal, "Metal cuban link")
    link.scale.x = 1.3
    link.rotation_euler[2] = angle + math.pi / 2
export("necklace_cuban_studio.glb")
