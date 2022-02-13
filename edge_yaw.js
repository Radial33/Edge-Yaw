UI.AddCheckbox("Edge Yaw");
UI.AddSliderInt("Extrapolated ticks", -5, 15);

function getuivalue(name, type) {
    var value = null;

    if (type) {
        value = UI.IsHotkeyActive("Misc", "JAVASCRIPT", "Script Items", name);
    } else {
        value = UI.GetValue("Misc", "JAVASCRIPT", "Script Items", name);
    }

    return value;
}

const extend_vector = function(pos,length,angle) {
    var rad = angle * Math.PI / 180;
    return [pos[0] + (Math.cos(rad) * length),pos[1] + (Math.sin(rad) * length), pos[2]];
}

function extrapolatePosition(position,entity,ticks) {
    const velocity = Entity.GetProp( entity, "CBasePlayer", "m_vecVelocity[0]" );
    return [ position[0] + velocity[0] / 64 * ticks, position[1] + velocity[1] / 64 * ticks, position[2] ]
}

function entity_getweapon(entity) {
	return Entity.GetName(Entity.GetWeapon(entity));
}

function entity_isinair(entity) {
	var fv = Entity.GetProp(entity, "CBasePlayer", "m_flFallVelocity");
	if(fv < -1 || fv > 1){
		return true;
	}
	return false;
}

function entity_isknife(entity) {
    var weapon = entity_getweapon(entity);
	if (weapon == "m9 bayonet" || weapon == "bayonet" || weapon == "flip knife" || weapon == "gut knife" || weapon == "karambit" || weapon == "butterfly knife" || weapon == "falchion knife" || weapon == "navaja knife" || weapon == "shadow daggers" || weapon == "stiletto knife" || weapon == "bowie knife" || weapon == "huntsman knife" || weapon == "talon knife" || weapon == "ursus knife" || weapon == "classic knife" || weapon == "paracord knife" || weapon == "survival knife" || weapon == "nomad knife" || weapon == "skeleton knife" || weapon == "knife")
		return true;
	else 
		return false;
}

function edge_yaw() {
    const me = Entity.GetLocalPlayer();
    const local_pos = Entity.GetEyePosition(me);
    local_pos = extrapolatePosition(local_pos,me,getuivalue("Extrapolated ticks"));
    
    const angles = Local.GetViewAngles()[1];

    const left_pos = extend_vector(local_pos,60,angles - 30);
    const right_pos = extend_vector(local_pos,60,angles + 30);

    const left_start = extend_vector(local_pos,30,angles-90);
    const right_start = extend_vector(local_pos,30,angles+90);

    left = Trace.Line(me,left_pos,right_pos)[1];
    right = Trace.Line(me,right_pos,left_pos)[1];
    left_point_inwall = Trace.Line(me, local_pos, left_start)[1] != 1;
    right_point_inwall = Trace.Line(me, local_pos, right_start)[1] != 1;
    left_inwall = Trace.Line(me,left_start,left_pos)[1] != 1 ? true : left_point_inwall;
    right_inwall = Trace.Line(me,right_start,right_pos)[1] != 1 ? true : right_point_inwall;
 
    if ((left_inwall || right_inwall) && !Input.IsKeyPressed(0x45))  {
        left = left_inwall ? 0 : left;
        right = right_inwall ? 0 : right;
        angle = 180 - (right - left) * 180;
        AntiAim.SetFakeOffset(angle);
        return true;
    }
    return false;
}

function customantiaim() {
    if (edge_yaw() && getuivalue("Edge Yaw") && !entity_isinair(Entity.GetLocalPlayer()) && !entity_isknife(Entity.GetLocalPlayer()) && !UI.IsHotkeyActive("Anti-Aim", "Extra", "Fake duck")) {
        AntiAim.SetOverride(1);
        edge_yaw();
    } else {
        AntiAim.SetOverride(0);
    }
}
Cheat.RegisterCallback("CreateMove", "customantiaim");