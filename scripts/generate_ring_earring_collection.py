"""Generate a coherent studio collection for rings and earrings."""

import math
import os
import bpy
from mathutils import Vector

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "models")


def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for material in list(bpy.data.materials):
        bpy.data.materials.remove(material)


def material(name, color, metallic, roughness):
    result = bpy.data.materials.new(name)
    result.diffuse_color = (*color, 1)
    result.metallic = metallic
    result.roughness = roughness
    return result


def smooth(obj):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def torus(name, major, minor, mat, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=112,
                                     minor_segments=24, location=location, rotation=(math.pi / 2, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    smooth(obj)
    return obj


def stone(name, location, radius, mat, scale=(1, 0.72, 1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    smooth(obj)
    return obj


def cylinder_between(name, start, end, radius, mat):
    direction = Vector(end) - Vector(start)
    midpoint = (Vector(start) + Vector(end)) / 2
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=radius, depth=direction.length, location=midpoint)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction)
    obj.data.materials.append(mat)
    smooth(obj)


def arc(name, center, radius_x, radius_z, start_deg, end_deg, thickness, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = thickness
    curve.bevel_resolution = 5
    spline = curve.splines.new("POLY")
    count = 96
    spline.points.add(count - 1)
    for index in range(count):
        angle = math.radians(start_deg + index * (end_deg - start_deg) / (count - 1))
        spline.points[index].co = (center[0] + radius_x * math.cos(angle), center[1], center[2] + radius_z * math.sin(angle), 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def export(filename):
    os.makedirs(ROOT, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, filename), export_format="GLB", export_materials="EXPORT")


def ring_materials():
    return (
        material("Metal", (0.83, 0.62, 0.16), 0.95, 0.18),
        material("StonePrimary", (0.82, 0.94, 1.0), 0.04, 0.04),
    )


reset()
metal, gem = ring_materials()
torus("Metal plain band", 1.34, 0.13, metal)
export("ring_plain_studio.glb")

reset()
metal, gem = ring_materials()
torus("Metal wide band", 1.34, 0.23, metal)
export("ring_wide_studio.glb")

reset()
metal, gem = ring_materials()
torus("Metal halo band", 1.34, 0.12, metal)
stone("StonePrimary center", (0, -0.07, 1.48), 0.28, gem)
for index in range(10):
    angle = 2 * math.pi * index / 10
    stone("StoneAccent halo", (0.36 * math.cos(angle), -0.02, 1.48 + 0.36 * math.sin(angle)), 0.075, gem)
export("ring_halo_studio.glb")

reset()
metal, gem = ring_materials()
torus("Metal three stone band", 1.34, 0.13, metal)
stone("StonePrimary center", (0, -0.06, 1.47), 0.25, gem)
stone("StoneAccent left", (-0.43, -0.03, 1.39), 0.19, gem)
stone("StoneAccent right", (0.43, -0.03, 1.39), 0.19, gem)
export("ring_three_stone_studio.glb")

reset()
metal, gem = ring_materials()
torus("Metal eternity band", 1.34, 0.105, metal)
for index in range(24):
    angle = 2 * math.pi * index / 24
    stone("StoneAccent eternity", (1.34 * math.cos(angle), -0.105, 1.34 * math.sin(angle)), 0.092, gem, (1, 0.62, 1))
export("ring_eternity_studio.glb")

reset()
metal, gem = ring_materials()
arc("Metal open ring", (0, 0, 0), 1.34, 1.34, 112, 428, 0.125, metal)
for angle in (112, 428):
    rad = math.radians(angle)
    stone("StonePrimary terminal", (1.34 * math.cos(rad), -0.02, 1.34 * math.sin(rad)), 0.19, gem)
export("ring_open_studio.glb")

reset()
metal, gem = ring_materials()
for x in (-0.62, 0.62):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.19, depth=0.08, location=(x, 0.08, 0), rotation=(math.pi / 2, 0, 0))
    setting = bpy.context.object
    setting.name = "Metal stud setting"
    setting.data.materials.append(metal)
    stone("StonePrimary stud", (x, -0.02, 0), 0.18, gem)
    cylinder_between("Metal stud post", (x, 0.08, 0), (x, 0.42, 0), 0.028, metal)
export("earring_stud_studio.glb")

reset()
metal, gem = ring_materials()
for x in (-0.72, 0.72):
    arc("Metal hoop", (x, 0, 0), 0.52, 0.68, 72, 468, 0.075, metal)
    stone("StoneAccent hoop", (x, -0.06, -0.69), 0.09, gem)
export("earring_hoop_studio.glb")

reset()
metal, gem = ring_materials()
for x in (-0.62, 0.62):
    stone("StonePrimary top", (x, 0, 0.7), 0.15, gem)
    cylinder_between("Metal drop link", (x, 0, 0.54), (x, 0, -0.32), 0.025, metal)
    stone("StonePrimary drop", (x, 0, -0.55), 0.24, gem, (0.72, 0.7, 1.35))
export("earring_drop_studio.glb")
